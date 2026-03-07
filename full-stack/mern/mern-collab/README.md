# CollabBoard — Real-Time Collaborative Whiteboard

A full-stack MERN application for real-time collaborative whiteboarding. Multiple users can draw, add shapes, write notes, and see each other's cursors live — powered by Socket.io.

---

## Features

- **Real-time collaboration** — See live cursors, strokes, and element changes from other users via WebSockets
- **Drawing tools** — Pen, line, rectangle, circle/ellipse, arrow, text, sticky notes, eraser
- **Board management** — Create, rename, duplicate, and delete boards
- **Share & collaborate** — Invite users by email or share a link; role-based permissions (editor / viewer)
- **Templates** — Start from blank, brainstorm, retrospective, mind-map, or wireframe layouts
- **Undo / Redo** — Full history stack with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- **Pan & Zoom** — Scroll to zoom, drag to pan the infinite canvas
- **Export** — Download boards as PNG or SVG
- **Dark / Light / System theme**
- **JWT authentication** with secure password hashing
- **Auto-save** — Elements are persisted to MongoDB automatically

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 19, Vite 6, Tailwind CSS v4             |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB + Mongoose                            |
| Realtime   | Socket.io v4                                  |
| Auth       | JWT + bcryptjs                                |
| Icons      | Lucide React                                  |
| Toasts     | react-hot-toast                               |
| Routing    | React Router v7                               |

---

## Project Structure

```
mern-collab/
├── server/
│   ├── controllers/       # Auth & board controllers
│   ├── middleware/         # JWT auth guard, error handler
│   ├── models/            # Mongoose schemas (User, Board)
│   ├── routes/            # Express route definitions
│   ├── socket/            # Socket.io event handler
│   ├── utils/             # DB connection, logger, helpers
│   ├── index.js           # Server entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── board/     # BoardCard, ShareModal, ExportMenu
│   │   │   ├── canvas/    # Canvas, Toolbar, ElementRenderer, CursorOverlay
│   │   │   ├── common/    # Modal, Loader, EmptyState, Avatar, ProtectedRoute
│   │   │   └── layout/    # AppLayout, Sidebar, Topbar
│   │   ├── context/       # AuthContext, ThemeContext, SocketContext
│   │   ├── hooks/         # useCanvas, useHistory
│   │   ├── lib/           # API client, utilities
│   │   ├── pages/         # Login, Register, Home, Board, Templates, Settings, Join
│   │   ├── App.jsx        # Router setup
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local instance or MongoDB Atlas connection string

### 1. Clone & install

```bash
# Server
cd server
cp .env.example .env    # Edit with your MONGO_URI and JWT_SECRET
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env`:

```env
PORT=5050
MONGO_URI=mongodb://localhost:27017/collab-board
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
```

### 3. Run

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

The client runs on **http://localhost:5173** and proxies API + WebSocket requests to port 5050.

---

## Keyboard Shortcuts

| Key           | Action              |
| ------------- | ------------------- |
| `V`           | Select tool         |
| `H`           | Pan tool            |
| `P`           | Pen tool            |
| `L`           | Line tool           |
| `R`           | Rectangle tool      |
| `C`           | Circle tool         |
| `A`           | Arrow tool          |
| `T`           | Text tool           |
| `S`           | Sticky note tool    |
| `E`           | Eraser tool         |
| `Ctrl+Z`      | Undo                |
| `Ctrl+Shift+Z`| Redo                |
| `Delete`      | Delete selected     |

---

## API Endpoints

### Auth
| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| POST   | `/api/auth/register` | Create account     |
| POST   | `/api/auth/login`    | Sign in            |
| GET    | `/api/auth/me`       | Get current user   |
| PUT    | `/api/auth/profile`  | Update profile     |
| PUT    | `/api/auth/password` | Change password    |

### Boards
| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/api/boards`                         | List user's boards       |
| POST   | `/api/boards`                         | Create board             |
| GET    | `/api/boards/templates`               | Get template list        |
| GET    | `/api/boards/code/:code`              | Get board by share code  |
| GET    | `/api/boards/:id`                     | Get board by ID          |
| PUT    | `/api/boards/:id`                     | Update board             |
| DELETE | `/api/boards/:id`                     | Delete board             |
| PUT    | `/api/boards/:id/elements`            | Save elements            |
| POST   | `/api/boards/:id/collaborators`       | Add collaborator         |
| DELETE | `/api/boards/:id/collaborators/:uid`  | Remove collaborator      |
| POST   | `/api/boards/:id/regenerate-code`     | Regenerate share code    |

---

## Socket Events

| Event             | Direction     | Description                          |
| ----------------- | ------------- | ------------------------------------ |
| `board:join`      | Client → Srv  | Join a board room                    |
| `board:leave`     | Client → Srv  | Leave a board room                   |
| `cursor:move`     | Client → Srv  | Broadcast cursor position            |
| `cursor:updated`  | Srv → Client  | Remote user's cursor update          |
| `element:add`     | Client → Srv  | Add a new element                    |
| `element:added`   | Srv → Client  | Element added by another user        |
| `element:update`  | Client → Srv  | Update an element                    |
| `element:updated` | Srv → Client  | Element updated by another user      |
| `element:delete`  | Client → Srv  | Delete an element                    |
| `element:deleted` | Srv → Client  | Element deleted by another user      |
| `elements:sync`   | Bidirectional | Full element state sync (undo/redo)  |
| `draw:progress`   | Client → Srv  | Live drawing preview                 |
| `board:users`     | Srv → Client  | Active users list for a board        |

---

## License

MIT
