import { useMemo, useState } from 'react'
import { Copy, Split } from 'lucide-react'
import { useAetherStore } from '../../store/useAetherStore'
import { generateComposeFromGraph, generateWorkspacePlan } from '../../lib/exporters'

const CodePane = ({ title, payload }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText?.(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (_) {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <h3 className="font-semibold text-white">{title}</h3>
        <button onClick={handleCopy} className="neon-pill flex items-center gap-2 text-cyan-200">
          <Copy size={14} /> {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="h-60 overflow-auto text-xs font-mono text-cyan-100/90">{payload || '# generate nodes to see output'}</pre>
    </div>
  )
}

const SchemaPanel = () => {
  const nodes = useAetherStore((state) => state.nodes)
  const edges = useAetherStore((state) => state.edges)

  const { composePreview, workspacePreview } = useMemo(() => {
    return {
      composePreview: generateComposeFromGraph(nodes, edges),
      workspacePreview: generateWorkspacePlan(nodes),
    }
  }, [nodes, edges])

  return (
    <section className="glass p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Exports</p>
          <h2 className="text-2xl font-semibold text-white">Composable blueprints</h2>
        </div>
        <span className="neon-pill flex items-center gap-2 text-sm">
          <Split size={16} /> dual export
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CodePane title="docker-compose.yml" payload={composePreview} />
        <CodePane title="workspace plan" payload={workspacePreview} />
      </div>
    </section>
  )
}

export default SchemaPanel
