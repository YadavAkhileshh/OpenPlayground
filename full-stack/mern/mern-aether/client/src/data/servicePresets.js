export const SERVICE_PRESETS = {
  client: {
    label: 'Client Surface',
    accent: 'from-cyan-400 via-sky-500 to-indigo-500',
    runtime: { image: 'node:18-alpine', command: 'npm run preview', ports: ['4173:4173'] },
    diagnostics: { latency: '38ms', health: 0.94, traffic: '120 req/s' },
  },
  gateway: {
    label: 'Edge Gateway',
    accent: 'from-blue-500 to-cyan-400',
    runtime: { image: 'nginx:1.27-alpine', command: 'nginx -g "daemon off;"', ports: ['443:443'] },
    diagnostics: { latency: '21ms', health: 0.9, traffic: '78 req/s' },
  },
  auth: {
    label: 'Identity Hub',
    accent: 'from-purple-500 to-fuchsia-500',
    runtime: { image: 'node:20-alpine', command: 'node dist/auth.js', ports: ['4001:4001'] },
    diagnostics: { latency: '45ms', health: 0.88, traffic: '74 req/s' },
  },
  database: {
    label: 'Vector Store',
    accent: 'from-emerald-500 to-lime-400',
    runtime: { image: 'mongo:7.0', command: 'mongod --replSet aether', ports: ['27017:27017'] },
    diagnostics: { latency: '12ms', health: 0.97, traffic: '140 ops/s' },
  },
  cache: {
    label: 'Edge Cache',
    accent: 'from-amber-400 to-orange-500',
    runtime: { image: 'redis:7.2-alpine', command: 'redis-server --save 60 1', ports: ['6379:6379'] },
    diagnostics: { latency: '4ms', health: 0.92, traffic: '6k ops/s' },
  },
  analytics: {
    label: 'Telemetry Mesh',
    accent: 'from-pink-500 to-rose-500',
    runtime: { image: 'grafana/grafana:11.0.0', command: 'run.sh', ports: ['3000:3000'] },
    diagnostics: { latency: '52ms', health: 0.86, traffic: '45 streams' },
  },
}

const withPreset = (id, preset, overrides = {}) => {
  const base = SERVICE_PRESETS[preset]
  return {
    id,
    type: 'serviceNode',
    position: overrides.position || { x: 0, y: 0 },
    data: {
      preset,
      name: overrides.name || base.label,
      tier: overrides.tier || 'core',
      status: overrides.status || 'stable',
      meta: overrides.meta || 'Synchronizing contracts',
      connections: overrides.connections || [],
      ...base,
    },
  }
}

export const INITIAL_TOPOLOGY = {
  nodes: [
    withPreset('client-shell', 'client', {
      position: { x: -420, y: -20 },
      tier: 'experience',
      meta: 'Rendering Next.js shell',
      connections: ['edge-gateway'],
    }),
    withPreset('edge-gateway', 'gateway', {
      position: { x: -130, y: -20 },
      tier: 'edge',
      meta: 'Layer 7 inspection active',
      connections: ['client-shell', 'identity-hub', 'vector-db', 'cache-mesh'],
    }),
    withPreset('identity-hub', 'auth', {
      position: { x: 170, y: -120 },
      tier: 'services',
      meta: 'JWT rotation in 27m',
      connections: ['edge-gateway', 'vector-db'],
    }),
    withPreset('vector-db', 'database', {
      position: { x: 460, y: -20 },
      tier: 'data',
      meta: 'Replica lag 12ms',
      connections: ['identity-hub', 'cache-mesh', 'telemetry-core'],
    }),
    withPreset('cache-mesh', 'cache', {
      position: { x: 170, y: 160 },
      tier: 'edge',
      meta: 'Shard balancing optimal',
      connections: ['edge-gateway', 'vector-db'],
    }),
    withPreset('telemetry-core', 'analytics', {
      position: { x: 460, y: 200 },
      tier: 'observability',
      meta: 'Live Flow replaying 2 events',
      connections: ['vector-db', 'cache-mesh'],
    }),
  ],
  edges: [
    {
      id: 'edge-client-gateway',
      source: 'client-shell',
      target: 'edge-gateway',
      type: 'pulseEdge',
      animated: true,
      data: { label: 'HTTPS', throughput: '120 req/s' },
    },
    {
      id: 'edge-gateway-auth',
      source: 'edge-gateway',
      target: 'identity-hub',
      type: 'pulseEdge',
      data: { label: 'gRPC', throughput: '78 req/s' },
    },
    {
      id: 'edge-auth-db',
      source: 'identity-hub',
      target: 'vector-db',
      type: 'pulseEdge',
      data: { label: 'Mongo driver', throughput: '74 ops/s' },
    },
    {
      id: 'edge-gateway-cache',
      source: 'edge-gateway',
      target: 'cache-mesh',
      type: 'pulseEdge',
      data: { label: 'Redis protocol', throughput: '6k ops/s' },
    },
    {
      id: 'edge-cache-db',
      source: 'cache-mesh',
      target: 'vector-db',
      type: 'pulseEdge',
      data: { label: 'Refresh', throughput: '2.4k ops/s' },
    },
    {
      id: 'edge-db-telemetry',
      source: 'vector-db',
      target: 'telemetry-core',
      type: 'pulseEdge',
      data: { label: 'Change stream', throughput: '45 events/s' },
    },
    {
      id: 'edge-cache-telemetry',
      source: 'cache-mesh',
      target: 'telemetry-core',
      type: 'pulseEdge',
      data: { label: 'Metrics', throughput: '5k ops/s' },
    },
  ],
}

export const FLOW_LIBRARY = [
  {
    id: 'user-login',
    label: 'User Login Playthrough',
    description: 'Client handshake through gateway, auth, and storage.',
    path: ['client-shell', 'edge-gateway', 'identity-hub', 'vector-db'],
    latency: '142ms',
  },
  {
    id: 'cache-miss',
    label: 'Cache Miss Recovery',
    description: 'Edge cache fallbacks into vector store.',
    path: ['client-shell', 'edge-gateway', 'cache-mesh', 'vector-db', 'cache-mesh'],
    latency: '81ms',
  },
  {
    id: 'telemetry-cast',
    label: 'Observability Fan-out',
    description: 'Change streams powering analytics mesh.',
    path: ['vector-db', 'telemetry-core', 'cache-mesh'],
    latency: '64ms',
  },
]

export const SIMULATION_TRIGGERS = [
  { id: 'traffic-spike', label: 'Traffic Spike', impact: '+65% load', tone: 'text-amber-300', detail: 'Synthetic 10k req/min burst' },
  { id: 'service-down', label: 'Service Pause', impact: 'Identity cooling', tone: 'text-rose-300', detail: 'Simulate auth degradation' },
  { id: 'migration', label: 'Hot Swap', impact: 'DB primary rotate', tone: 'text-cyan-300', detail: 'Switch primaries without downtime' },
]

export const ROOM_ID = 'aether-lab'
