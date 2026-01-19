# Chess Game - Day 145

A modern, full-stack chess game built with React and Node.js featuring real-time multiplayer gameplay.

## Features

- ♔ **Complete Chess Logic**: All standard chess rules including:
  - All piece movements (Pawn, Rook, Knight, Bishop, Queen, King)
  - Special moves (Castling, En Passant, Pawn Promotion)
  - Check and Checkmate detection
  - Move validation

- 🎮 **Game Modes**:
  - Local play (two players on same device)
  - Online multiplayer (real-time via WebSockets)

- 🎨 **Modern UI**:
  - Glassmorphism effects
  - Smooth animations
  - Interactive piece highlighting
  - Legal move indicators
  - Captured pieces display
  - Move history tracking

## Tech Stack

### Frontend
- React 18
- Vite
- Socket.IO Client
- Modern CSS with animations

### Backend
- Node.js
- Express
- Socket.IO
- Custom chess engine

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd "Day 145/backend"
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd "Day 145/frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## How to Play

### Local Mode
1. Click "Local Game" from the menu
2. Play chess with two players on the same device
3. Click on a piece to see legal moves
4. Click on a highlighted square to move

### Online Mode
1. Click "Online Game" from the menu
2. Enter your name
3. Either:
   - Create a new game and share the game code
   - Join an existing game using a game code
4. Wait for opponent to join
5. Play chess in real-time!

## Game Controls

- **Click** on a piece to select it and see legal moves
- **Click** on a highlighted square to move the piece
- **Reset Game** button to start a new game
- **Menu** button to return to the main menu

## Features Implemented

✅ All piece movements and rules  
✅ Move validation  
✅ Check detection  
✅ Checkmate detection  
✅ Castling (kingside and queenside)  
✅ En passant  
✅ Pawn promotion  
✅ Move history  
✅ Captured pieces tracking  
✅ Real-time multiplayer  
✅ Modern, responsive UI  

## Architecture

The game uses a client-server architecture:

- **Frontend (React)**: Handles UI, user interactions, and real-time updates
- **Backend (Node.js)**: Manages game logic, validates moves, and coordinates multiplayer sessions
- **WebSockets (Socket.IO)**: Enables real-time communication between players

## License

MIT

---

Built for Day 145 of the 100 Days of Web Development Challenge
