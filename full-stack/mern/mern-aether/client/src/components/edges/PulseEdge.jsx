import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { clsx } from 'clsx'

const PulseEdge = (props) => {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data } = props
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
  const isActive = Boolean(data?.activeFlow)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 2.4, stroke: isActive ? '#4fe3ff' : undefined }}
        className={clsx('stroke-cyan-200/60', isActive && 'animate-edge-pulse drop-shadow-glow')}
        markerEnd="url(#pulse-arrow)"
      />
      <EdgeLabelRenderer>
        <div
          className={clsx(
            'absolute -translate-x-1/2 text-[11px] font-mono bg-black/60 backdrop-blur px-2 py-1 rounded-full border border-white/10',
            isActive ? 'text-neon' : 'text-cyan-100/60',
          )}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {data?.label}{' '}
          <span className="text-white/40">{data?.throughput}</span>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(PulseEdge)
