const API_BASE = '/api'

const getToken = () => localStorage.getItem('collab_token')

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
})

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

const api = {
  // ── Auth ──────────────────────────────────────────
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: headers() }).then(handleResponse),

  updateProfile: (body) =>
    fetch(`${API_BASE}/auth/profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  changePassword: (body) =>
    fetch(`${API_BASE}/auth/password`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  // ── Boards ────────────────────────────────────────
  getBoards: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/boards?${qs}`, { headers: headers() }).then(handleResponse)
  },

  getBoard: (id) =>
    fetch(`${API_BASE}/boards/${id}`, { headers: headers() }).then(handleResponse),

  getBoardByCode: (code) =>
    fetch(`${API_BASE}/boards/code/${code}`, { headers: headers() }).then(handleResponse),

  createBoard: (body) =>
    fetch(`${API_BASE}/boards`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  updateBoard: (id, body) =>
    fetch(`${API_BASE}/boards/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  saveElements: (id, body) =>
    fetch(`${API_BASE}/boards/${id}/elements`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  deleteBoard: (id) =>
    fetch(`${API_BASE}/boards/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // ── Collaborators ─────────────────────────────────
  addCollaborator: (boardId, body) =>
    fetch(`${API_BASE}/boards/${boardId}/collaborators`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  removeCollaborator: (boardId, userId) =>
    fetch(`${API_BASE}/boards/${boardId}/collaborators/${userId}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  regenerateShareCode: (boardId) =>
    fetch(`${API_BASE}/boards/${boardId}/share-code`, { method: 'POST', headers: headers() }).then(handleResponse),

  // ── Templates ─────────────────────────────────────
  getTemplates: () =>
    fetch(`${API_BASE}/boards/templates`).then(handleResponse),
}

export default api
