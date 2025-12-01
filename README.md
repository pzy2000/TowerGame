# Cute Tower Defense 🏰🐰

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)

**Cute Tower Defense** is a real-time 1v1 competitive tower defense game where strategy meets cuteness! Defend your base with adorable towers while sending waves of charming monsters to overwhelm your opponent.

> **Note:** This project is a web-based multiplayer game built with Node.js and HTML5 Canvas.

## 🎮 Features

- **Real-Time 1v1 Multiplayer:** Battle against another player in real-time.
- **Cute Art Style:** Enjoy a vibrant, "Q-version" aesthetic with cute animals and colorful towers.
- **Strategic Gameplay:** Balance your resources between building defenses and launching attacks.
- **Diverse Units:**
  - **Towers:** 🏹 Basic, 🔫 Rapid Fire, ❄️ Slow/Ice, 🔥 Inferno.
  - **Monsters:** 🐰 Fast Bunny, 🐼 Tank Panda, 👹 Titan.
- **Interactive UI:** Easy-to-use drag-and-drop or click-to-place interface.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/tower-defense-game.git
    cd tower-defense-game
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

4.  **Play the game:**
    Open your browser and navigate to `http://localhost:3001`.
    *Tip: Open two browser windows to simulate a match locally!*

## 🕹️ How to Play

1.  **Objective:** Reduce your opponent's health to 0 while keeping yours above 0.
2.  **Resources (💎):** You earn resources over time and by defeating monsters. Use them wisely!
3.  **Defend:** Select towers from the bottom-left panel and place them on your map to stop incoming monsters.
4.  **Attack:** Select monsters from the bottom-right panel to spawn them on your opponent's map.
5.  **Win:** The first player to lose all 20 ❤️ Hearts loses the game.

## 🛠️ Technology Stack

- **Backend:** Node.js, Express
- **Real-time Communication:** Socket.IO
- **Frontend:** HTML5 Canvas, Vanilla JavaScript, CSS3
- **Design:** Custom game engine with entity-component-like structure.

## 📂 Project Structure

```
tower-defense-game/
├── public/             # Frontend assets and code
│   ├── assets/         # Images and sounds
│   ├── js/             # Game logic (Entities, Game Loop, Main)
│   ├── index.html      # Entry point
│   └── style.css       # Styling
├── server/             # Backend code
│   └── index.js        # Express server & Socket.IO logic
├── plan.md             # Game design document
└── package.json        # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! If you have ideas for new towers, monsters, or features, feel free to fork the repository and submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ by [Your Name]*
