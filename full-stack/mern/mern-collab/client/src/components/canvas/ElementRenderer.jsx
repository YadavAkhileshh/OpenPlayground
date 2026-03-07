/**
 * Renders SVG elements for each board element.
 */
export default function ElementRenderer({ element, isSelected, onSelect }) {
  const { id, type, x, y, width, height, points, text, color, fill, strokeWidth, fontSize, fontFamily, opacity, rotation, imageUrl } = element

  const transform = rotation ? `rotate(${rotation} ${x + width / 2} ${y + height / 2})` : undefined
  const style = { opacity, cursor: 'pointer' }

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect?.(id)
  }

  const selectionStroke = isSelected ? '#6366f1' : undefined
  const selectionWidth = isSelected ? 2 : 0

  switch (type) {
    case 'pen': {
      if (!points || points.length < 2) return null
      const d = points.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
      }, '')
      return (
        <g onClick={handleClick} style={style}>
          <path d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {isSelected && <path d={d} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" />}
        </g>
      )
    }

    case 'line': {
      const p = points && points.length >= 2 ? points : [{ x: 0, y: 0 }, { x: width, y: height }]
      const x1 = x + p[0].x
      const y1 = y + p[0].y
      const x2 = x + p[1].x
      const y2 = y + p[1].y
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          {isSelected && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={selectionStroke} strokeWidth={selectionWidth} strokeDasharray="4 4" />}
        </g>
      )
    }

    case 'arrow': {
      const p = points && points.length >= 2 ? points : [{ x: 0, y: 0 }, { x: width, y: height }]
      const x1 = x + p[0].x
      const y1 = y + p[0].y
      const x2 = x + p[1].x
      const y2 = y + p[1].y
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const headLen = 12
      const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6)
      const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6)
      const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6)
      const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6)
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={color} />
          {isSelected && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={selectionStroke} strokeWidth={selectionWidth} strokeDasharray="4 4" />}
        </g>
      )
    }

    case 'rectangle':
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <rect x={x} y={y} width={Math.abs(width)} height={Math.abs(height)} stroke={color} strokeWidth={strokeWidth} fill={fill} rx={4} />
          {isSelected && <rect x={x - 2} y={y - 2} width={Math.abs(width) + 4} height={Math.abs(height) + 4} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" rx={6} />}
          {text && (
            <text x={x + Math.abs(width) / 2} y={y + Math.abs(height) / 2} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontFamily={fontFamily} fill={color}>
              {text}
            </text>
          )}
        </g>
      )

    case 'circle':
    case 'ellipse': {
      const rx = Math.abs(width) / 2
      const ry = Math.abs(height) / 2
      const cx = x + rx
      const cy = y + ry
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={color} strokeWidth={strokeWidth} fill={fill} />
          {isSelected && <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" />}
          {text && (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontFamily={fontFamily} fill={color}>
              {text}
            </text>
          )}
        </g>
      )
    }

    case 'text':
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          {isSelected && <rect x={x - 4} y={y - fontSize} width={Math.max(width, text.length * fontSize * 0.6) + 8} height={fontSize + 8} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" rx={4} />}
          <text x={x} y={y} fontSize={fontSize} fontFamily={fontFamily} fill={color} dominantBaseline="auto">
            {text}
          </text>
        </g>
      )

    case 'sticky': {
      const w = width || 200
      const h = height || 150
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <rect x={x} y={y} width={w} height={h} fill={fill || '#fef08a'} stroke={color === '#000000' ? 'transparent' : color} strokeWidth={1} rx={4} filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
          {isSelected && <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" rx={6} />}
          <foreignObject x={x + 10} y={y + 10} width={w - 20} height={h - 20}>
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: `${fontSize}px`, fontFamily, color: '#1f2937', wordWrap: 'break-word', height: '100%', overflow: 'hidden' }}>
              {text}
            </div>
          </foreignObject>
        </g>
      )
    }

    case 'image':
      if (!imageUrl) return null
      return (
        <g onClick={handleClick} style={style} transform={transform}>
          <image href={imageUrl} x={x} y={y} width={width || 200} height={height || 200} preserveAspectRatio="xMidYMid meet" />
          {isSelected && <rect x={x - 2} y={y - 2} width={(width || 200) + 4} height={(height || 200) + 4} stroke={selectionStroke} strokeWidth={selectionWidth} fill="none" strokeDasharray="4 4" rx={4} />}
        </g>
      )

    default:
      return null
  }
}
