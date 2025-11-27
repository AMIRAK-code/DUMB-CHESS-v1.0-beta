<p align="center">
  <h1 align="center">♟️ Dumb Chess</h1>
  <p align="center">
    <strong>Chaos. Betrayal. Physics.</strong><br>
    <i>A web-based chess variant where the rules are made up and the points don't matter.</i>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Pug-A86454?style=for-the-badge&logo=pug&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

<br>

## 📖 About The Project

**Dumb Chess** is not your grandfather's chess game. It strips away the complexity of traditional chess and replaces it with pure chaos. Built with **Node.js** and **Pug**, this web app features a custom "AI" opponent, simplified movement mechanics, and a few surprises.

In this game, strategy takes a backseat to survival. Will you defeat the enemy King, or will you accidentally eat your own pawns in a fit of confusion?

### ✨ Key Features

* **🛡️ Simplified Roster:** No Bishops, no Knights, no Queens. Just Pawns and a King.
* **👑 The "King" Movement:** **ALL** pieces (Pawns included) move 1 block in any direction.
* **⚔️ Friendly Fire System:** Accidental clicks matter! You can attack and kill your own pieces.
* **🤖 Aggressive AI:** A custom-coded opponent that prioritizes killing your King above all else.
* **🔄 Dramatic Endings:** The entire game board spins upside down when a King falls.

---

## 🎮 How To Play

1.  **The Goal:** Kill the enemy King (Black ♚).
2.  **Movement:** Click a piece to select it. Click any adjacent square (including diagonals) to move.
3.  **The Twist:** You can move onto a square occupied by your own piece to capture it. *Be careful!*
4.  **Game Over:** The game ends immediately if a King dies. The board will flip to signal the end of the war.

---

## 🚀 Installation & Setup

Follow these steps to get the game running on your local machine.

### Prerequisites
* Node.js installed.

### Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/dumb-chess.git](https://github.com/yourusername/dumb-chess.git)
    cd dumb-chess
    ```

2.  **Install dependencies**
    ```bash
    npm install express pug
    ```

3.  **Run the server**
    ```bash
    node app.js
    ```

4.  **Play!**
    Open your browser and navigate to:
    `http://localhost:3000`

---

## 📂 Project Structure

```text
dumb-chess/
├── app.js              # The Main Server (Express)
├── public/
│   └── script.js       # Game Logic (Movement, AI, Rules)
└── views/
    └── index.pug       # The UI & Embedded CSS
