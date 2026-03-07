import {
  Pencil,
  Minus,
  Square,
  Circle,
  ArrowRight,
  Type,
  StickyNote,
  MousePointer2,
  Eraser,
  Hand,
  Image,
} from 'lucide-react'
import { cn, COLOR_PALETTE, STROKE_WIDTHS } from '../../lib/utils'
import { useState } from 'react'

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
]

export default function Toolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fill,
  onFillChange,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showStrokePicker, setShowStrokePicker] = useState(false)

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2">
      {/* Tool buttons */}
      <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onToolChange(id)}
            title={label}
            className={cn(
              'relative rounded-lg p-2 transition-colors',
              activeTool === id
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Color picker */}
      {['pen', 'line', 'rectangle', 'circle', 'arrow', 'text', 'sticky'].includes(activeTool) && (
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowStrokePicker(false) }}
            className="rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            title="Color"
          >
            <div
              className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color }}
            />
          </button>

          {showColorPicker && (
            <div className="absolute left-12 top-0 z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <div className="grid grid-cols-4 gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => { onColorChange(c); setShowColorPicker(false) }}
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                      color === c ? 'border-indigo-500 scale-110' : 'border-transparent',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="mt-2 h-8 w-full cursor-pointer rounded border-0"
              />
            </div>
          )}
        </div>
      )}

      {/* Stroke width */}
      {['pen', 'line', 'rectangle', 'circle', 'arrow'].includes(activeTool) && (
        <div className="relative">
          <button
            onClick={() => { setShowStrokePicker(!showStrokePicker); setShowColorPicker(false) }}
            className="rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            title="Stroke width"
          >
            <div className="flex h-5 w-5 items-center justify-center">
              <div
                className="rounded-full bg-gray-800 dark:bg-gray-200"
                style={{ width: Math.min(strokeWidth * 3, 18), height: Math.min(strokeWidth * 3, 18) }}
              />
            </div>
          </button>

          {showStrokePicker && (
            <div className="absolute left-12 top-0 z-50 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => { onStrokeWidthChange(w); setShowStrokePicker(false) }}
                  className={cn(
                    'flex h-8 w-16 items-center justify-center rounded-lg transition-colors',
                    strokeWidth === w
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                  )}
                >
                  <div
                    className="rounded-full bg-gray-800 dark:bg-gray-200"
                    style={{ width: '100%', height: w }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
