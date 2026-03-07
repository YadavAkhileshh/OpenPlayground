import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID for canvas elements.
 */
export function generateId() {
  return `el_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Get relative mouse/touch position on the canvas.
 */
export function getCanvasPoint(e, canvasRef, viewport) {
  const rect = canvasRef.current.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  return {
    x: (clientX - rect.left - viewport.x) / viewport.zoom,
    y: (clientY - rect.top - viewport.y) / viewport.zoom,
  }
}

/**
 * Calculate bounding box for a set of points.
 */
export function getBoundingBox(points) {
  if (!points || points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * Check if a point is inside a rectangle.
 */
export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height
}

/**
 * Get the distance between two points.
 */
export function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
}

/**
 * Default element factory.
 */
export function createElement(type, x, y, overrides = {}) {
  return {
    id: generateId(),
    type,
    x,
    y,
    width: 0,
    height: 0,
    points: [],
    text: '',
    color: '#000000',
    fill: 'transparent',
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: 'sans-serif',
    opacity: 1,
    rotation: 0,
    layer: 0,
    locked: false,
    imageUrl: '',
    ...overrides,
  }
}

/**
 * Sticky note color palette.
 */
export const STICKY_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Pink', value: '#fecaca' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Orange', value: '#fed7aa' },
]

/**
 * Stroke width options.
 */
export const STROKE_WIDTHS = [1, 2, 3, 5, 8]

/**
 * Color palette for drawing.
 */
export const COLOR_PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
  '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#64748b', '#0ea5e9',
]

/**
 * Format a date for display.
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatRelative(date) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}
