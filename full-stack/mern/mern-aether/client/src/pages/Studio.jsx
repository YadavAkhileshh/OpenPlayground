import HeroHeader from '../components/sections/HeroHeader'
import CanvasShell from '../components/CanvasShell'
import CanvasHud from '../components/CanvasHud'
import FlowPanel from '../components/FlowPanel'
import ExportPanel from '../components/ExportPanel'
import { useCollaboration } from '../context/CollaborationContext'
import { useAetherStore } from '../store/useAetherStore'
import { Activity } from 'lucide-react'

const Studio = () => {
  const { broadcastCursor, broadcastSimulation, stopRemoteSimulation } = useCollaboration()
  const simulation = useAetherStore((state) => state.simulation)

  const handlePointer = (point) => {
    broadcastCursor(point)
  }

  const handleRunFlow = (payload) => {
    const nextPayload = {
      ...payload,
      path: payload.path?.length ? payload.path : simulation.path,
    }
    broadcastSimulation(nextPayload)
  }

  return (
    <div>
      <HeroHeader />
      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-slate-950/80 to-black/80">
          <CanvasHud />
          <CanvasShell onPointerSignal={handlePointer} />
          {simulation?.active ? (
            <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-3 text-xs font-mono text-white/70">
              <Activity size={14} className="text-cyan-300" />
              Live flow · {simulation.label || simulation.flowId}
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <FlowPanel onRunFlow={handleRunFlow} onStopFlow={stopRemoteSimulation} />
          <ExportPanel />
        </section>
      </main>
    </div>
  )
}

export default Studio
