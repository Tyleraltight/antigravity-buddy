<img width="443" height="121" alt="image" src="https://github.com/user-attachments/assets/101d1ab8-d063-4a03-87d2-9f862d0a6933" />

# Antigravity Buddy 🛸

> A Dynamic Island-style desktop companion for AI Agent state visualization and workspace orchestration.

[English](#english) | [简体中文](#简体中文)

---

<a name="english"></a>

## English

Inspired by [CodeIsland](https://github.com/wxtsky/CodeIsland), Antigravity Buddy is a minimalist desktop status indicator designed specifically for AI-driven development. It bridges the gap between background AI processes and user focus with a sleek, non-intrusive "Dynamic Island" capsule.

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

---

<a name="简体中文"></a>

## 简体中文

受 [CodeIsland](https://github.com/wxtsky/CodeIsland) 启发，Antigravity Buddy 是一款专为 AI 协作开发的桌面状态指示器。它利用极简的“灵动岛”外观，在不打断工作流的前提下，实时反馈 Agent 的运行状态。

### ✨ 核心特性
- **现代美学**：受 macOS 启发的透明胶囊外观，包含平滑的微交互动画。
- **状态感知**：实时同步并显示 `Thinking` (思考中), `Coding` (编码中) 和 `Success` (任务完成) 状态。
- **智能唤起**：点击状态胶囊，即可瞬间恢复、居中并激活关联的项目 IDE 窗口。
- **极致轻量**：基于 Rust & Tauri 开发，资源占用极低。

---

### 🚀 快速开始

#### 环境要求
- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://rustup.rs/) (Stable)
- Windows 操作系统 (目前针对 Windows 窗口管理进行了深度优化)

#### 安装步骤
1. 克隆仓库:
   ```bash
   git clone https://github.com/Tyleraltight/antigravity-buddy.git
   cd antigravity-buddy
   ```
2. 安装依赖:
   ```bash
   npm install
   ```

#### 构建编译
生成经过优化的生产环境运行文件：
```bash
npm run tauri build
```
编译产物位于: `src-tauri/target/release/tauri-app.exe`.

---

### 🛠️ 使用说明

#### 1. 启动程序
直接运行 `tauri-app.exe`。程序默认处于隐藏状态，仅在接收到状态更新请求时显示。

#### 2. API 集成
程序会在本地 `3003` 端口运行 HTTP 服务。你可以通过简单的 API 调用来控制小人的状态：

- **切换至思考状态**: `GET http://localhost:3003/state/thinking`
- **切换至编码状态**: `GET http://localhost:3003/state/coding`
- **显示任务完成**: `GET http://localhost:3003/state/success`

#### 3. 唤起功能
当通知显示时，**点击胶囊**将触发内置指令：寻找 `Antigravity.exe` 进程，将其窗口移至屏幕正中心并激活到前台，显著提升 Agent 协作时的操作效率。

---

## License
MIT
