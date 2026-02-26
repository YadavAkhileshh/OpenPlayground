import { useMemo } from 'react'
import { useAetherStore } from '../store/useAetherStore'

const parseLatency = (value = '') => {
  const numeric = parseFloat(value)
  return Number.isNaN(numeric) ? 0 : numeric
}

export const useDiagramInsights = () => {
  const nodes = useAetherStore((state) => state.nodes)
  const edges = useAetherStore((state) => state.edges)

  return useMemo(() => {
    if (!nodes?.length) {
      return {
        nodeCount: 0,
        edgeCount: edges?.length || 0,
        avgLatency: 0,
        tiers: {},
      }
    }

    const tiers = nodes.reduce((acc, node) => {
      const tier = node.data?.tier || 'core'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {})

    const latencies = nodes.map((node) => parseLatency(node.data?.diagnostics?.latency)).filter(Boolean)
    const avgLatency = latencies.length ? Math.round(latencies.reduce((sum, item) => sum + item, 0) / latencies.length) : 0

    return {
      nodeCount: nodes.length,
      edgeCount: edges?.length || 0,
      avgLatency,
      tiers,
    }
  }, [nodes, edges])
}
