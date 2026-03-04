const FALLBACK_API = 'http://localhost:5050'
const baseUrl = import.meta.env.VITE_API_URL || FALLBACK_API

export const fetchLayout = async (roomId) => {
  try {
    const res = await fetch(`${baseUrl}/api/layouts/${roomId}`)
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.warn('Unable to fetch layout snapshot', error?.message)
    return null
  }
}

export const persistLayout = async (roomId, payload) => {
  try {
    await fetch(`${baseUrl}/api/layouts/${roomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.warn('Unable to persist layout snapshot', error?.message)
  }
}
