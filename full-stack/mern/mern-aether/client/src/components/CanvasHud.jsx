import { useState } from 'react'
import { Copy, Users, Grid3x3, Radar, Plus } from 'lucide-react'
import { useAetherStore } from '../store/useAetherStore'
import { SERVICE_PRESETS } from '../data/servicePresets'

const CanvasHud = () => {
  const roomId = useAetherStore((state) => state.roomId)
  const overlays = useAetherStore((state) => state.overlays)
  const toggleOverlay = useAetherStore((state) => state.toggleOverlay)
  const presence = useAetherStore((state) => state.presence)
  const setNodes = useAetherStore((state) => state.setNodes)
  const [copied, setCopied] = useState(false)

  const copyRoom = async () => {
    try {
      await navigator.clipboard?.writeText?.(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (_) {
      setCopied(false)
    }
  }

  const spawnNode = (presetKey) => {
    const preset = SERVICE_PRESETS[presetKey]
    if (!preset) return
    setNodes((nodes) => [
      ...nodes,
      {
        id: `${presetKey}-${Date.now().toString(36)}`,
        type: 'serviceNode',
        position: { x: Math.random() * 300 - 150, y: Math.random() * 200 - 100 },
        data: {
          preset: presetKey,
          name: `${preset.label} #${nodes.length + 1}`,
          tier: 'experimental',
          status: 'stable',
          meta: 'New node awaiting wiring',
          connections: [],
          ...preset,
        },
      },
    ])
  }

  return (
    <div className="absolute left-6 top-6 flex flex-wrap items-center gap-3">
      <div className="glass px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/70">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-normal text-white">
          <Users size={14} className="text-cyan-300" />
          {Object.keys(presence || {}).length + 1} architects live
        </div>
        <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
          <span>{roomId}</span>
          <button onClick={copyRoom} className="text-cyan-300 hover:text-white transition" aria-label="Copy room id">
            <Copy size={12} />
          </button>
          <span className="text-emerald-300 text-[10px]">{copied ? 'copied' : 'share'}</span>
        </div>
      </div>

      <div className="glass flex items-center gap-2 px-4 py-2 text-[11px] font-semibold">
        <button
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            overlays.grid ? 'border-cyan-400/60 text-cyan-200' : 'border-white/10 text-white/60'
          }`}
          onClick={() => toggleOverlay('grid')}
        >
          <Grid3x3 size={14} /> grid
        </button>
        <button
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            overlays.minimap ? 'border-cyan-400/60 text-cyan-200' : 'border-white/10 text-white/60'
          }`}
          onClick={() => toggleOverlay('minimap')}
        >
          <Radar size={14} /> minimap
        </button>
      </div>

      <div className="glass flex items-center gap-2 px-4 py-2 text-[11px] font-semibold">
        <Plus size={14} className="text-cyan-300" />
        {Object.keys(SERVICE_PRESETS).map((key) => (
          <button
            key={key}
            onClick={() => spawnNode(key)}
            className="rounded-full border border-white/10 px-2 py-1 capitalize text-white/70 hover:border-cyan-400/50"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CanvasHud
