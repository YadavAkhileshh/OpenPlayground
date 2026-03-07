import { useState, useRef } from 'react'
import { Download, Image, FileText } from 'lucide-react'

export default function ExportMenu({ svgRef, boardName }) {
  const [open, setOpen] = useState(false)

  const exportAs = async (format) => {
    setOpen(false)
    const svg = svgRef?.current
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })

    if (format === 'svg') {
      downloadBlob(blob, `${boardName || 'board'}.svg`)
      return
    }

    // Convert to PNG via canvas
    const img = new window.Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (pngBlob) => {
          downloadBlob(pngBlob, `${boardName || 'board'}.png`)
          URL.revokeObjectURL(url)
        },
        'image/png',
      )
    }
    img.src = url
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
      >
        <Download size={16} />
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-44">
            <button
              onClick={() => exportAs('png')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
            >
              <Image size={14} /> Export as PNG
            </button>
            <button
              onClick={() => exportAs('svg')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
            >
              <FileText size={14} /> Export as SVG
            </button>
          </div>
        </>
      )}
    </div>
  )
}
