import { FLOW_LIBRARY, SIMULATION_TRIGGERS } from '../../data/servicePresets'
import { useCollaboration } from '../../context/CollaborationContext'
import { useAetherStore } from '../../store/useAetherStore'
import { Play, Zap } from 'lucide-react'

const FlowPlaybookTable = () => {
  const { broadcastSimulation } = useCollaboration()
  const simulation = useAetherStore((state) => state.simulation)

  const startFlow = (flow) => {
    const payload = { ...flow, flowId: flow.id }
    broadcastSimulation(payload)
  }

  const startTrigger = (trigger) => {
    broadcastSimulation({
      flowId: `${trigger.id}-${Date.now()}`,
      label: trigger.label,
      path: FLOW_LIBRARY[0]?.path || [],
      trigger,
    })
  }

  return (
    <section className="glass p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Playbook</p>
        <h2 className="text-2xl font-semibold text-white">Scenarios & Triggers</h2>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/50">
            <tr>
              <th className="px-4 py-3">Scenario</th>
              <th className="px-4 py-3">Hops</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {FLOW_LIBRARY.map((flow) => {
              const active = simulation?.active && simulation.flowId === flow.id
              return (
                <tr key={flow.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{flow.label}</p>
                    <p className="text-white/50">{flow.description}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/70">{flow.path.join(' → ')}</td>
                  <td className="px-4 py-3 text-white/70">{flow.latency}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startFlow(flow)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        active ? 'border-emerald-400/70 text-emerald-200' : 'border-white/10 text-white/70'
                      }`}
                    >
                      <Play size={12} /> {active ? 'running' : 'run'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {SIMULATION_TRIGGERS.map((trigger) => (
          <button
            key={trigger.id}
            onClick={() => startTrigger(trigger)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 hover:border-cyan-400/40"
          >
            <span className="flex items-center gap-2 font-semibold text-white">
              <Zap size={16} className="text-amber-300" />
              {trigger.label}
            </span>
            <p className="mt-1 text-xs text-white/60">{trigger.detail}</p>
            <p className={`${trigger.tone} mt-2 text-xs font-mono`}>{trigger.impact}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default FlowPlaybookTable
