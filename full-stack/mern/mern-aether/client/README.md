## Aether Client

The client is a Vite + React experience powered by React Flow, Zustand, Tailwind, Lucide, and Framer Motion. It renders the infinite system design canvas, multiplayer HUD, and export utilities.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite dev server on [http://localhost:5173](http://localhost:5173). |
| `npm run build` | Creates a production build inside `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint with the React + Hooks rules. |

### Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5050` | REST endpoint used for persistence. |
| `VITE_SOCKET_URL` | `http://localhost:5050` | Socket.io endpoint for presence + diagram sync. |

Create a `.env.local` file if you need to override the defaults:

```
VITE_API_URL=https://aether-api.yourdomain.dev
VITE_SOCKET_URL=https://aether-api.yourdomain.dev
```

### Tech decisions

- **React Flow + custom node types** for neon service tiles, ReactFlowProvider is initialized in `src/main.jsx`.
- **Zustand** drives the canonical diagram state and export previews.
- **Socket.io** messages get initialized by `useLiveCollaboration`, automatically persisting diagrams via the REST API.
- **Tailwind** is configured with an Obsidian Neon palette (see `tailwind.config.js`).
- **React Router** powers the multi-surface experience (`Studio`, `Playbooks`, `Blueprints`) mounted under `src/pages` with a shared `AppLayout`.
