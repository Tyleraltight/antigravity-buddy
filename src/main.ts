import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

type AgentState = "hidden" | "idle" | "working" | "success" | "error";

interface AgentEvent {
  status: string;
  message?: string;
}

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("island-container");
  const capsule = document.getElementById("island-capsule");
  const textSpan = document.getElementById("state-text");
  const ctxMenu = document.getElementById("ctx-menu")!;
  if (!capsule || !textSpan || !container || !ctxMenu) return;

  let hideTimeout: number;
  // Timestamp (ms) until which incoming events are suppressed
  let sleepUntil = 0;
  // Action-level state machine: tracks whether we're mid-action
  // false = idle (waiting for new action), true = active (suppress further working events)
  let actionActive = false;

  const isSleeping = () => Date.now() < sleepUntil;

  const setState = (state: AgentState, message?: string) => {
    capsule.className = state;

    if (message) {
      textSpan.textContent = message;
      capsule.classList.add("expanded");
    } else {
      capsule.classList.remove("expanded");
    }

    clearTimeout(hideTimeout);

    if (state !== "hidden") {
      getCurrentWindow().setIgnoreCursorEvents(false).catch(console.error);
      hideTimeout = window.setTimeout(() => setState("hidden"), 2500);
    } else {
      getCurrentWindow().setIgnoreCursorEvents(true).catch(console.error);
    }
  };

  // --- Sleep helpers ---
  const showSleepIndicator = (minutes: number) => {
    // Show a brief "sleeping" toast then hide
    capsule.className = "sleeping";
    capsule.classList.remove("expanded");
    textSpan.textContent = `💤 休眠 ${minutes} 分钟`;
    capsule.classList.add("expanded");
    getCurrentWindow().setIgnoreCursorEvents(false).catch(console.error);
    clearTimeout(hideTimeout);
    hideTimeout = window.setTimeout(() => setState("hidden"), 2000);
  };

  const setSleep = (minutes: number) => {
    sleepUntil = Date.now() + minutes * 60 * 1000;
    closeMenu();
    showSleepIndicator(minutes);
  };

  const cancelSleep = () => {
    sleepUntil = 0;
    closeMenu();
    setState("hidden");
  };

  // --- Context menu ---
  const closeMenu = () => {
    ctxMenu.classList.remove("visible");
  };

  const openMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Update "cancel" option visibility
    const cancelBtn = document.getElementById("ctx-cancel-sleep")!;
    if (isSleeping()) {
      const remaining = Math.ceil((sleepUntil - Date.now()) / 60000);
      cancelBtn.textContent = `▶ 取消休眠（剩余 ${remaining} 分钟）`;
      cancelBtn.style.display = "flex";
    } else {
      cancelBtn.style.display = "none";
    }

    ctxMenu.classList.add("visible");
  };

  capsule.addEventListener("contextmenu", openMenu);

  document.getElementById("ctx-sleep-15")!.addEventListener("click", () => setSleep(15));
  document.getElementById("ctx-sleep-30")!.addEventListener("click", () => setSleep(30));
  document.getElementById("ctx-cancel-sleep")!.addEventListener("click", cancelSleep);

  // Close menu on any click outside
  document.addEventListener("click", (e) => {
    if (!ctxMenu.contains(e.target as Node)) closeMenu();
  });
  document.addEventListener("contextmenu", (e) => {
    // If right-click was NOT on the capsule, close menu
    if (!capsule.contains(e.target as Node)) closeMenu();
  });

  // Initial OS setup for hidden state
  getCurrentWindow().setIgnoreCursorEvents(true).catch(console.error);

  // Left-click: bring Antigravity IDE to front
  capsule.addEventListener("click", (e) => {
    if ((e as MouseEvent).button !== 0) return;
    invoke("bring_to_front").catch(console.error);
    setState("hidden");
  });

  // Listen to Tauri emitted events from axum HTTP server
  // State machine: each action shows capsule at most 2 times:
  //   1st: working (start of action)
  //   2nd: success or error (end of action)
  // All intermediate working events are silently suppressed.
  await listen<AgentEvent>("agent-state-changed", (event) => {
    const payload = event.payload;
    if (!["idle", "thinking", "coding", "working", "success", "error"].includes(payload.status)) return;
    // Suppress notifications during sleep
    if (isSleeping()) return;
    // Map legacy thinking/coding to unified working state
    const mapped = (payload.status === "thinking" || payload.status === "coding")
      ? "working" : payload.status;

    if (mapped === "working") {
      // Only show the first working event per action; suppress the rest
      if (actionActive) return;
      actionActive = true;
      setState("working", payload.message);
    } else if (mapped === "success" || mapped === "error") {
      // Terminal state: show result and reset for the next action
      setState(mapped as AgentState, payload.message);
      actionActive = false;
    } else {
      // idle or other: passthrough and reset
      setState(mapped as AgentState, payload.message);
      actionActive = false;
    }
  });

  // Useful for local testing via DevTools console
  (window as any).testState = setState;
  (window as any).setSleep = setSleep;
});
