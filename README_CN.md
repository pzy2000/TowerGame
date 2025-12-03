# 萌萌塔防 🏰🐰

[English](README.md) | [中文](README_CN.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)

**萌萌塔防** 是一款实时 1v1 竞技塔防游戏，策略与可爱并存！用可爱的防御塔保卫你的基地，同时派遣成群的迷人怪物去淹没你的对手。

> **注意：** 这是一个使用 Node.js 和 HTML5 Canvas 构建的基于 Web 的多人游戏。

## 🎮 特性

- **实时 1v1 多人对战：** 与另一名玩家实时对战。
- **可爱画风：** 享受充满活力的“Q版”美学，拥有可爱的动物和多彩的防御塔。
- **策略玩法：** 在建造防御和发起攻击之间平衡你的资源。
- **多样化单位：**
  - **防御塔：** 🏹 基础塔, 🔫 连射塔, ❄️ 减速/冰冻塔, 🔥 烈焰塔。
  - **怪物：** 🐰 快速兔子, 🐼 坦克熊猫, 👹 泰坦。
- **交互式 UI：** 易于使用的拖放或点击放置界面。

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) (v14 或更高版本)
- [npm](https://www.npmjs.com/)

### 安装

1.  **克隆仓库：**
    ```bash
    git clone https://github.com/yourusername/tower-defense-game.git
    cd tower-defense-game
    ```

2.  **安装依赖：**
    ```bash
    npm install
    ```

3.  **启动服务器：**
    ```bash
    npm start
    ```

4.  **开始游戏：**
    打开浏览器并访问 `http://localhost:3001`。
    *提示：打开两个浏览器窗口可以在本地模拟一场比赛！*

## 🕹️ 游戏指南

1.  **目标：** 将对手的生命值降至 0，同时保持自己的生命值在 0 以上。
2.  **资源 (💎)：** 你会随着时间推移和击败怪物获得资源。明智地使用它们！
3.  **防御：** 从左下角面板选择防御塔并将其放置在你的地图上以阻止入侵的怪物。
4.  **攻击：** 从右下角面板选择怪物将它们生成在对手的地图上。
5.  **获胜：** 第一个失去所有 20 ❤️ 红心的玩家输掉游戏。

## 🛠️ 技术栈

- **后端：** Node.js, Express
- **实时通信：** Socket.IO
- **前端：** HTML5 Canvas, Vanilla JavaScript, CSS3
- **设计：** 具有类似实体组件结构的自定义游戏引擎。

## 📂 项目结构

```
tower-defense-game/
├── public/             # 前端资源和代码
│   ├── assets/         # 图片和声音
│   ├── js/             # 游戏逻辑 (实体, 游戏循环, 主程序)
│   ├── index.html      # 入口点
│   └── style.css       # 样式
├── server/             # 后端代码
│   └── index.js        # Express 服务器 & Socket.IO 逻辑
├── plan.md             # 游戏设计文档
└── package.json        # 项目依赖
```

## 🤝 贡献

欢迎贡献！如果你有新防御塔、怪物或功能的想法，请随时 fork 仓库并提交 pull request。

1.  Fork 本项目
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

*由 Pzy 用 ❤️ 制作*
