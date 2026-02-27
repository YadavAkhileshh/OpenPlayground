import { memo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react'
import ServiceNode from './ServiceNode'
import PulseEdge from './edges/PulseEdge'
import PresenceLayer from './PresenceLayer'
import { useAetherStore } from '../store/useAetherStore'

const nodeTypes = { serviceNode: ServiceNode }
const edgeTypes = { pulseEdge: PulseEdge }

const CanvasShell = ({ onPointerSignal }) => {
  const nodes = useAetherStore((state) => state.nodes)
  const edges = useAetherStore((state) => state.edges)
  const onNodesChange = useAetherStore((state) => state.onNodesChange)
  const onEdgesChange = useAetherStore((state) => state.onEdgesChange)
  const onConnect = useAetherStore((state) => state.onConnect)
  const overlays = useAetherStore((state) => state.overlays)

  const handlePointerMove = useCallback(
    (event) => {
      if (!onPointerSignal) return
      const bounds = event.currentTarget.getBoundingClientRect()
      onPointerSignal({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
    },
    [onPointerSignal],
  )

  return (
    <div className="relative h-full rounded-[32px] bg-black/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="text-[12px] font-mono"
        onMouseMove={handlePointerMove}
      >
        {overlays.grid ? <Background color="rgba(79,227,255,0.12)" gap={32} /> : null}
        {overlays.minimap ? <MiniMap pannable zoomable className="!bg-black/40" /> : null}
        <Controls className="bg-black/70 border border-white/10 rounded-2xl" />
        <Panel position="bottom-right" className="text-xs uppercase tracking-[0.4em] text-white/40">
          aether live flow
        </Panel>
        <svg className="hidden">
          <defs>
            <marker id="pulse-arrow" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto">
              <path d="M0,0 L12,6 L0,12 z" fill="#4fe3ff" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>
      <PresenceLayer />
    </div>
  )
}

export default memo(CanvasShell)
