import { Play, Square, Activity, Zap } from 'lucide-react'
import { FLOW_LIBRARY, SIMULATION_TRIGGERS } from '../data/servicePresets'
import { useAetherStore } from '../store/useAetherStore'

const FlowPanel = ({ onRunFlow, onStopFlow }) => {
  const simulation = useAetherStore((state) => state.simulation)

  const runFlow = (flow) => {
    const payload = { ...flow, triggeredAt: Date.now() }
    onRunFlow?.(payload)
  }

  const stopFlow = () => {
    onStopFlow?.()
  }

  return (
    <section className="glass p-6 text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Live Flow</p>
          <h2 className="text-2xl font-semibold">Simulation Console</h2>
        </div>
        {simulation?.active ? (
          <button onClick={stopFlow} className="neon-pill flex items-center gap-2 text-rose-200">
            <Square size={14} /> stop
          </button>
        ) : null}
      </div>

      <div className="space-y-4">
        {FLOW_LIBRARY.map((flow) => {
          const isActive = simulation?.active && simulation.flowId === flow.id
          return (
            <article
              key={flow.id}
              className={`rounded-2xl border px-4 py-3 transition ${
                isActive ? 'border-cyan-400/80 bg-cyan-500/10' : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">Scenario</p>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Activity size={14} className="text-cyan-300" /> {flow.label}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{flow.description}</p>
                </div>
                <button
                  onClick={() => runFlow({ ...flow, flowId: flow.id })}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] flex items-center gap-2 ${
                    isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/70'
                  }`}
                >
                  <Play size={12} /> {isActive ? 'running' : 'run'}
                </button>
              </div>
              <p className="mt-3 text-[11px] font-mono text-white/60">
                Path: {flow.path.join(' → ')} • Latency {flow.latency}
              </p>
            </article>
          )
        })}
      </div>

      <div className="mt-6 text-xs uppercase tracking-[0.4em] text-white/40">Triggers</div>
      <div className="mt-3 grid gap-3">
        {SIMULATION_TRIGGERS.map((trigger) => (
          <button
            key={trigger.id}
            onClick={() =>
              onRunFlow?.({
                flowId: `${trigger.id}-${Date.now()}`,
                label: trigger.label,
                path: simulation?.path?.length ? simulation.path : FLOW_LIBRARY[0]?.path || [],
                trigger,
              })
            }
            className="flex items-center justify-between rounded-2xl border border-white/5 px-4 py-3 text-left text-sm hover:border-cyan-400/40"
          >
            <span className="flex items-center gap-2">
              <Zap size={14} className="text-amber-300" />
              {trigger.label}
            </span>
            <span className={`${trigger.tone} text-xs font-mono`}>{trigger.impact}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default FlowPanel
