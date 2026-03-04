# Aether · Collaborative System Architect

Aether is a "Miro-for-architects" playground that lets teams model distributed systems, watch packets traverse service nodes, and export infra-ready artifacts. It is designed as a hero project that showcases premium UI taste, real-time collaboration, and pragmatic developer tooling.

## Feature Highlights
- **Infinite Canvas + React Flow** — custom neon service nodes, magnetic connectors, minimap, and presence overlays.
- **Live Flow Mode** — trigger pre-built journeys (login, cache miss, observability fan-out) and watch edges pulse while packets animate across tiers.
- **Multi-Surface Navigation** — Studio for the canvas, Playbooks for curated simulations, and Blueprints for exporting infra-ready manifests.
- **Multiplayer Sync** — Socket.io relays diagram mutations, cursors, and flow triggers with room-level snapshots.
- **Persistent Layouts** — Mongo-backed REST API saves node + edge state per room, with in-memory fallback for offline demos.
- **Export-to-Code Panel** — instant `docker-compose.yml` generation plus workspace scaffolding suggestions sourced from the live topology.

## Stack
| Layer | Tech |
| --- | --- |
| Frontend | Vite, React 19, React Flow (`@xyflow/react`), Tailwind, Zustand, Framer Motion, Lucide Icons |
| Realtime | Socket.io, custom presence protocol |
| Backend | Node.js, Express 5, MongoDB (Mongoose), CORS, Dotenv |
| Tooling | Tailwind Merge, ESLint (Flat), Docker-friendly exporters |

## Getting Started
1. **Install dependencies**
   ```bash
   # client
   cd full-stack/mern/mern-aether/client
   npm install
   
   # server
   cd ../server
   npm install
   ```
2. **Configure environment**
   ```bash
   cd server
   cp .env.example .env
   # edit ORIGIN and MONGO_URI as needed
   ```
3. **Run the stack**
   ```bash
   # terminal 1 - backend
   cd server
   npm run dev
   
   # terminal 2 - frontend
   cd ../client
   npm run dev
   ```

The client defaults to `http://localhost:5173` and expects the API/socket server at `http://localhost:5050`.

## Collaboration Protocol
| Event | Direction | Payload |
| --- | --- | --- |
| `room:join` | client → server | `{ roomId, user }` registers collaborators and emits the cached diagram. |
| `diagram:update` | client → server → room | `{ nodes, edges }` diff broadcast plus persistence hook. |
| `cursor:move` | client ↔ server | `{ x, y, user }` drives neon cursors. |
| `simulation:run` | client ↔ server | `{ flowId, path, label }` highlights packet routes for every participant. |
| `simulation:stop` | client ↔ server | Clears edge pulses + HUD state. |

## Repo Layout
```
mern-aether/
├── plan.md              # roadmap + phase checklist
├── README.md            # this file
├── client/              # Vite app with canvas + HUD
│   ├── src/pages/       # Studio / Playbooks / Blueprints surfaces
│   ├── src/components/  # Canvas + HUD + panels
│   └── src/context/     # Collaboration provider for routing
└── server/              # Express + Socket.io service
```

### API Routes
- `GET /api/layouts/:roomId` → fetch saved diagram.
- `POST /api/layouts/:roomId` → upsert nodes and edges.
- `GET /health` → liveness probe.

Aether fits neatly into the OpenPlayground hero tier: it blends tasteful Obsidian/Neon visuals with practical developer workflows that highlight real-time collaboration and exportable infrastructure insights.
