import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

type AgentState = "hidden" | "idle" | "thinking" | "coding" | "success";

interface AgentEvent {
  status: AgentState;
  message?: string;
}

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("island-container");
  const capsule = document.getElementById("island-capsule");
  const textSpan = document.getElementById("state-text");
  if (!capsule || !textSpan || !container) return;

  let hideTimeout: number;

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
      // Show capsule: Re-enable window click interception for dismissing
      getCurrentWindow().setIgnoreCursorEvents(false).catch(console.error);
      // transient smart notification logic: auto hide after 2.5s
      hideTimeout = window.setTimeout(() => setState("hidden"), 2500);
    } else {
      // Hidden: Tell OS to completely ignore mouse events to prevent "dead zone" invisible barrier
      getCurrentWindow().setIgnoreCursorEvents(true).catch(console.error);
    }
  };

  // Initial OS setup for hidden state
  getCurrentWindow().setIgnoreCursorEvents(true).catch(console.error);

  // Click to bring Antigravity to front, then dismiss notification
  capsule.addEventListener("click", () => {
    invoke("bring_to_front").catch(console.error);
    setState("hidden");
  });

  // Listen to Tauri emitted events from axum HTTP server
  await listen<AgentEvent>("agent-state-changed", (event) => {
    const payload = event.payload;
    if (["idle", "thinking", "coding", "success"].includes(payload.status)) {
      setState(payload.status, payload.message);
    }
  });

  // Useful for local testing via DevTools console
  (window as any).testState = setState;
});
