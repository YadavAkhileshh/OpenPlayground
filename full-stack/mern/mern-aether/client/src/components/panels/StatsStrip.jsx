import { Activity, Share2, Link2 } from 'lucide-react'
import { useDiagramInsights } from '../../hooks/useDiagramInsights'

const StatsStrip = () => {
  const { nodeCount, edgeCount, avgLatency, tiers } = useDiagramInsights()

  return (
    <section className="glass mb-8 grid gap-4 p-4 sm:grid-cols-3 text-sm">
      <div className="rounded-2xl border border-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Nodes</p>
        <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
          <Share2 size={20} className="text-cyan-300" /> {nodeCount}
        </div>
        <p className="mt-2 text-white/60">{Object.keys(tiers).length} tiers mapped</p>
      </div>
      <div className="rounded-2xl border border-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Edges</p>
        <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
          <Link2 size={20} className="text-emerald-300" /> {edgeCount}
        </div>
        <p className="mt-2 text-white/60">Connections in current topology</p>
      </div>
      <div className="rounded-2xl border border-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Avg latency</p>
        <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white">
          <Activity size={20} className="text-amber-300" /> {avgLatency}
          <span className="text-base">ms</span>
        </div>
        <p className="mt-2 text-white/60">Computed from node diagnostics</p>
      </div>
    </section>
  )
}

export default StatsStrip
