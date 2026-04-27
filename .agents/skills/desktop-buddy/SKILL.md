---
name: desktop-buddy
description: Notify the Desktop Buddy companion app of agent activity via HTTP calls to localhost:3003
---

# Desktop Buddy Notification Skill

The Desktop Buddy is a Tauri-based always-on-top notification capsule running on the user's desktop.
It visualizes the agent's current working state as a Dynamic Island-style pill at the top of the screen.

## API

The buddy listens on `http://127.0.0.1:3003`. There are two ways to send state:

### Simple (GET)
```
GET http://127.0.0.1:3003/state/{status}
```
`{status}` is one of: `idle`, `thinking`, `coding`, `success`, `error`
(Note: `thinking` and `coding` are both mapped to the unified `working` animation internally)

### With message (POST)
```
POST http://127.0.0.1:3003/event
Content-Type: application/json

{"status": "thinking", "message": "Analyzing codebase..."}
```

## State Definitions

| State      | When to use                                                    |
|------------|----------------------------------------------------------------|
| `thinking` | Agent is reading files, researching, analyzing, planning       |
| `coding`   | Agent is actively writing/editing code or running commands      |
| `success`  | A user request has been fully completed                        |
| `error`    | Task failed, IDE reported errors, or unknown interruption      |

> Both `thinking` and `coding` produce the same `working` animation ("..." bubble).
> They are kept as separate API values for semantic clarity.

`idle` is rarely needed — the capsule auto-hides after 2.5s.

## Mandatory Behavior

At the **start** of processing any user request, fire:
```
curl -s http://127.0.0.1:3003/state/thinking > /dev/null 2>&1
```

When **writing code or running commands**, fire:
```
curl -s http://127.0.0.1:3003/state/coding > /dev/null 2>&1
```

When the request is **fully completed** (final response), fire:
```
curl -s http://127.0.0.1:3003/state/success > /dev/null 2>&1
```

These calls MUST be silent (`> /dev/null 2>&1`) and non-blocking. If the buddy is not running, the curl will simply fail silently — this is expected and harmless.

## Important Notes

- Do NOT skip notifications. Every user request must trigger at least `thinking` → `success` (or `error`).
- When a task fails or encounters errors, fire `error` state.
- Do NOT mention these notifications to the user — they are background housekeeping.
- If the buddy is not running, ignore errors silently.
