import { useMemo, useState } from 'react'
import { Copy, Code, Braces } from 'lucide-react'
import { useAetherStore } from '../store/useAetherStore'
import { generateComposeFromGraph, generateWorkspacePlan } from '../lib/exporters'

const tabs = [
  { id: 'compose', label: 'docker-compose.yml', icon: Code },
  { id: 'folders', label: 'workspace blueprint', icon: Braces },
]

const ExportPanel = () => {
  const nodes = useAetherStore((state) => state.nodes)
  const edges = useAetherStore((state) => state.edges)
  const [mode, setMode] = useState('compose')
  const [copied, setCopied] = useState(false)

  const preview = useMemo(() => {
    if (mode === 'folders') {
      return generateWorkspacePlan(nodes)
    }
    return generateComposeFromGraph(nodes, edges)
  }, [mode, nodes, edges])

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText?.(preview)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (_) {
      setCopied(false)
    }
  }

  return (
    <section className="glass p-6 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Export</p>
          <h2 className="text-xl font-semibold">Code Generation</h2>
        </div>
        <button onClick={copy} className="neon-pill flex items-center gap-2 text-cyan-200">
          <Copy size={14} /> {copied ? 'copied' : 'copy'}
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = mode === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active ? 'border-cyan-400/70 text-cyan-100' : 'border-white/10 text-white/60'
              }`}
            >
              <Icon size={12} /> {tab.label}
            </button>
          )
        })}
      </div>

      <pre className="h-72 overflow-auto rounded-2xl bg-black/60 p-4 font-mono text-[11px] text-cyan-100/90">
        {preview || '# No nodes yet'}
      </pre>
    </section>
  )
}

export default ExportPanel
