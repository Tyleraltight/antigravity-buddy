# Antigravity Buddy

[中文](#中文) | [English](#english)

---

## 中文

### 简介
**Antigravity Buddy** 是一款专为 AI Agent 开发流程设计的桌面交互助手。它通过受灵动岛启发的 UI 状态胶囊，实时反馈 Agent 的思考与编码进度。

### 核心功能
- **状态同步**：实时显示 Thinking, Coding, Success 等状态。
- **一键唤起**：点击胶囊，瞬间将隐藏或偏离中心的 Antigravity IDE 唤回桌面正中心并激活。
- **零侵入 UI**：极简透明交互，不遮挡工作流。

### 灵感来源
本项目的设计灵感来源于 [CodeIsland](https://github.com/wxtsky/CodeIsland)，感谢其对桌面 Agent 交互体验的探索。

---

## English

### Introduction
**Antigravity Buddy** is a Dynamic Island-inspired desktop companion tailored for AI Agent workflows. It provides real-time visual feedback on the Agent's thought process and coding progress through a sleek, transient capsule UI.

### Key Features
- **State Synchronization**: Real-time visualization of Thinking, Coding, and Success states.
- **Instant Focus**: Click the capsule to instantly bring the Antigravity IDE to the center of the screen and focus the window.
- **Non-intrusive UI**: Minimalist, transparent design that stays out of your way.

### Inspiration
This project is inspired by [CodeIsland](https://github.com/wxtsky/CodeIsland). Special thanks for their innovative approach to desktop Agent interaction.

---

## Quick Start
1. Build the project: `npm run tauri build`
2. Run the executable in `src-tauri/target/release/`
3. Control the state via HTTP: `GET http://localhost:3003/state/thinking`
