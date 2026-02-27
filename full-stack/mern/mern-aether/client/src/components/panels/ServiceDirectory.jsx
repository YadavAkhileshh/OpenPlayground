import { useAetherStore } from '../../store/useAetherStore'

const badgeTone = {
  experience: 'text-cyan-200 border-cyan-400/40',
  edge: 'text-amber-200 border-amber-400/40',
  services: 'text-purple-200 border-purple-400/40',
  data: 'text-emerald-200 border-emerald-400/40',
  observability: 'text-pink-200 border-pink-400/40',
}

const ServiceDirectory = () => {
  const nodes = useAetherStore((state) => state.nodes)

  return (
    <section className="glass p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Directory</p>
          <h2 className="text-2xl font-semibold text-white">Service registry</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {nodes.map((node) => (
          <article key={node.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{node.data?.name}</h3>
                <p className="text-white/60">{node.data?.meta}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
                  badgeTone[node.data?.tier] || 'text-white/60 border-white/10'
                }`}
              >
                {node.data?.tier}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-xs font-mono text-white/70 sm:grid-cols-3">
              <div>
                <p className="text-white/40">Latency</p>
                <p>{node.data?.diagnostics?.latency}</p>
              </div>
              <div>
                <p className="text-white/40">Health</p>
                <p>{Math.round((node.data?.diagnostics?.health || 0) * 100)}%</p>
              </div>
              <div>
                <p className="text-white/40">Throughput</p>
                <p>{node.data?.diagnostics?.traffic}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServiceDirectory
