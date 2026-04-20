<img width="443" height="121" alt="image" src="https://github.com/user-attachments/assets/101d1ab8-d063-4a03-87d2-9f862d0a6933" />

# Antigravity Buddy 🛸

> A Dynamic Island-style desktop companion for AI Agent state visualization and workspace orchestration.

[English](README.md) | [简体中文](README_zh.md)

---

Inspired by [CodeIsland](https://github.com/wxtsky/CodeIsland), Antigravity Buddy is a minimalist desktop status indicator designed specifically for AI-driven development. It bridges the gap between background AI processes and user focus with a sleek, non-intrusive "Dynamic Island" capsule.

### 🎭 Bot States

| Thinking | Coding | Success |
| :---: | :---: | :---: |
| <img src="src/assets/alien-transparent.png" width="80"> | <img src="src/assets/alien-transparent.png" width="80"> | <img src="src/assets/alien-transparent.png" width="80"> |
| *Energy Pulse & "..." Bubble* | *Energy Pulse & "..." Bubble* | *Laugh Shake & "Hhhhhh" Bubble* |

### ✨ Key Features
- **Modern UI**: Apple-style transparent capsule with fluid animations and micro-interactions.
- **Agent Awareness**: Real-time status feedback for `Thinking`, `Coding`, and `Success` states.
- **Smart Click-to-Focus**: Click the capsule to instantly restore, center, and focus the project IDE window.
- **Lightweight & Fast**: Built with Rust (Tauri) for minimal resource footprint.

---

### 🚀 Getting Started

#### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://rustup.rs/) (Stable)
- Windows OS (Currently optimized for Windows window management)

#### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Tyleraltight/antigravity-buddy.git
   cd antigravity-buddy
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

#### Building
To generate the optimized production executable:
```bash
npm run tauri build
```
The executable will be located at: `src-tauri/target/release/tauri-app.exe`.

---

### 🛠️ Usage

#### 1. Start the Buddy
Simply run the compiled `tauri-app.exe`. By default, it stays hidden and only appears when receiving state updates.

#### 2. Control via API
Antigravity Buddy hosts a local HTTP server on port `3003`. You can integrate it with any script or CLI tool:

- **Thinking State**: `GET http://localhost:3003/state/thinking`
- **Coding State**: `GET http://localhost:3003/state/coding`
- **Success Notification**: `GET http://localhost:3003/state/success`

#### 3. Focus Feature
When a notification is visible, **clicking the capsule** will trigger the `bring_to_front` command, which automatically locates the `Antigravity.exe` process, centers it on your screen, and brings it to the foreground.

#### 4. Architecture & Workflow

```mermaid
sequenceDiagram
    participant User as User
    participant Agent as AI Agent
    participant Script as buddy.ps1
    participant Tauri as Desktop Buddy

    User->>Agent: Prompt / Request
    Agent->>Script: Run `buddy.ps1 thinking`
    
    alt Tauri App Not Running
        Script->>Tauri: Start `tauri-app.exe`
    end
    
    Script->>Tauri: GET /state/thinking
    Tauri-->>User: Show "Thinking" animation
    
    Agent->>Agent: Reasoning & Tool Calls
    
    Agent->>Script: Run `buddy.ps1 coding`
    Script->>Tauri: GET /state/coding
    Tauri-->>User: Update to "Coding" state
    
    Agent->>Script: Run `buddy.ps1 success`
    Script->>Tauri: GET /state/success
    Tauri-->>User: Show "Success" & auto-hide
    Agent-->>User: Task completed
```

---

## License
MIT
