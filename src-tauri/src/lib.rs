use tauri::Manager;
use tauri::Emitter;
use tokio::net::TcpListener;
use axum::{routing::{get, post}, Router, extract::{State, Path, Json}};
use serde::{Deserialize, Serialize};

// Windows API FFI bindings for window management (zero external deps)
#[cfg(target_os = "windows")]
mod win_focus {
    use std::os::windows::ffi::OsStringExt;
    use std::ffi::OsString;

    type HWND = isize;
    type HANDLE = isize;
    type BOOL = i32;
    type DWORD = u32;
    type LPARAM = isize;

    const SW_RESTORE: i32 = 9;
    const SM_CXSCREEN: i32 = 0;
    const SM_CYSCREEN: i32 = 1;
    const SWP_NOZORDER: u32 = 0x0004;
    const SWP_NOACTIVATE: u32 = 0x0010;
    const PROCESS_QUERY_LIMITED_INFORMATION: DWORD = 0x1000;

    #[repr(C)]
    struct RECT { left: i32, top: i32, right: i32, bottom: i32 }

    extern "system" {
        fn EnumWindows(cb: unsafe extern "system" fn(HWND, LPARAM) -> BOOL, lp: LPARAM) -> BOOL;
        fn IsWindowVisible(hwnd: HWND) -> BOOL;
        fn GetWindowThreadProcessId(hwnd: HWND, pid: *mut DWORD) -> DWORD;
        fn OpenProcess(access: DWORD, inherit: BOOL, pid: DWORD) -> HANDLE;
        fn CloseHandle(h: HANDLE) -> BOOL;
        fn GetSystemMetrics(index: i32) -> i32;
        fn GetWindowRect(hwnd: HWND, rect: *mut RECT) -> BOOL;
        fn SetForegroundWindow(hwnd: HWND) -> BOOL;
        fn ShowWindow(hwnd: HWND, cmd: i32) -> BOOL;
        fn SetWindowPos(hwnd: HWND, after: HWND, x: i32, y: i32, cx: i32, cy: i32, flags: u32) -> BOOL;
        fn IsIconic(hwnd: HWND) -> BOOL;
        // K32GetProcessImageFileNameW lives in kernel32.dll
        fn K32GetProcessImageFileNameW(process: HANDLE, name: *mut u16, size: DWORD) -> DWORD;
    }

    // Get the executable name (e.g. "Antigravity.exe") for a given PID
    fn get_process_exe_name(pid: DWORD) -> Option<String> {
        unsafe {
            let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
            if handle == 0 { return None; }
            let mut buf = [0u16; 512];
            let len = K32GetProcessImageFileNameW(handle, buf.as_mut_ptr(), buf.len() as DWORD);
            CloseHandle(handle);
            if len == 0 { return None; }
            let path = OsString::from_wide(&buf[..len as usize]).to_string_lossy().to_string();
            // Extract filename from full device path
            path.rsplit('\\').next().map(|s| s.to_string())
        }
    }

    // Callback context passed through LPARAM
    struct SearchCtx {
        target_exe: String, // e.g. "Antigravity.exe"
        found: HWND,
    }

    unsafe extern "system" fn enum_cb(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let ctx = &mut *(lparam as *mut SearchCtx);
        if IsWindowVisible(hwnd) == 0 { return 1; } // skip invisible

        let mut pid: DWORD = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 { return 1; }

        if let Some(exe) = get_process_exe_name(pid) {
            if exe.eq_ignore_ascii_case(&ctx.target_exe) {
                ctx.found = hwnd;
                return 0; // stop enumeration
            }
        }
        1 // continue
    }

    /// Find the Antigravity window, bring it to foreground, and center on screen.
    pub fn focus_and_center(exe_name: &str) -> Result<(), String> {
        let mut ctx = SearchCtx {
            target_exe: exe_name.to_string(),
            found: 0,
        };

        unsafe {
            EnumWindows(enum_cb, &mut ctx as *mut SearchCtx as LPARAM);
        }

        if ctx.found == 0 {
            return Err(format!("Window for '{}' not found", exe_name));
        }

        unsafe {
            let hwnd = ctx.found;

            // Restore if minimized
            if IsIconic(hwnd) != 0 {
                ShowWindow(hwnd, SW_RESTORE);
            }

            // Get current window size
            let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
            if GetWindowRect(hwnd, &mut rect) == 0 {
                return Err("Failed to get window rect".into());
            }
            let w = rect.right - rect.left;
            let h = rect.bottom - rect.top;

            // Get screen size
            let screen_w = GetSystemMetrics(SM_CXSCREEN);
            let screen_h = GetSystemMetrics(SM_CYSCREEN);

            // Center coordinates
            let x = (screen_w - w) / 2;
            let y = (screen_h - h) / 2;

            // Move to center (keep z-order, we'll use SetForegroundWindow for activation)
            SetWindowPos(hwnd, 0, x, y, w, h, SWP_NOZORDER | SWP_NOACTIVATE);

            // Activate
            SetForegroundWindow(hwnd);
        }

        Ok(())
    }
}

#[derive(Clone)]
struct AppState {
    app_handle: tauri::AppHandle,
}

#[derive(Clone, Deserialize, Serialize)]
struct AgentEvent {
    status: String,
    message: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Bring the Antigravity IDE window to foreground and center it on screen.
#[tauri::command]
fn bring_to_front() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        win_focus::focus_and_center("Antigravity.exe")?;
        Ok("Antigravity window focused and centered".into())
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Only supported on Windows".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.primary_monitor() {
                    let screen_size = monitor.size();
                    // window_size might be slightly wrong before show, but since it's fixed 500 in config it should be roughly right.
                    let window_size = window.outer_size().unwrap_or(tauri::PhysicalSize::new(500, 100));
                    let x = (screen_size.width as i32 - window_size.width as i32) / 2;
                    let y = 10;
                    let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition::new(x, y)));
                }
            }

            tauri::async_runtime::spawn(async move {
                let state = AppState { app_handle };
                let router = Router::new()
                    .route("/task-finished", get(task_finished_handler))
                    .route("/state/:status", get(status_handler))
                    .route("/event", post(event_handler))
                    .with_state(state);
                
                let listener = TcpListener::bind("127.0.0.1:3003").await.unwrap();
                println!("Listening on 3003");
                let _ = axum::serve(listener, router).await;
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, bring_to_front])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn task_finished_handler(State(state): State<AppState>) -> &'static str {
    let _ = state.app_handle.emit("task-finished", ());
    "Success"
}

async fn status_handler(State(state): State<AppState>, Path(status): Path<String>) -> String {
    let event = AgentEvent {
        status: status.clone(),
        message: None,
    };
    let _ = state.app_handle.emit("agent-state-changed", event);
    format!("Status set to {}", status)
}

async fn event_handler(State(state): State<AppState>, Json(payload): Json<AgentEvent>) -> String {
    let _ = state.app_handle.emit("agent-state-changed", payload);
    "Event Dispatched".to_string()
}
