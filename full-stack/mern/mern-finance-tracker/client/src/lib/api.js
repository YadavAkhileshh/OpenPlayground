const API_BASE = '/api'

const getToken = () => localStorage.getItem('finance_token')

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
  // ── Auth ─────────────────────────────────────────
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

  // ── Transactions ─────────────────────────────────
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/transactions?${qs}`, { headers: headers() }).then(handleResponse)
  },

  getTransaction: (id) =>
    fetch(`${API_BASE}/transactions/${id}`, { headers: headers() }).then(handleResponse),

  createTransaction: (body) =>
    fetch(`${API_BASE}/transactions`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  updateTransaction: (id, body) =>
    fetch(`${API_BASE}/transactions/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  deleteTransaction: (id) =>
    fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // ── Budgets ──────────────────────────────────────
  getBudgets: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/budgets?${qs}`, { headers: headers() }).then(handleResponse)
  },

  createBudget: (body) =>
    fetch(`${API_BASE}/budgets`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  updateBudget: (id, body) =>
    fetch(`${API_BASE}/budgets/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  deleteBudget: (id) =>
    fetch(`${API_BASE}/budgets/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // ── Accounts ─────────────────────────────────────
  getAccounts: () =>
    fetch(`${API_BASE}/accounts`, { headers: headers() }).then(handleResponse),

  getAccount: (id) =>
    fetch(`${API_BASE}/accounts/${id}`, { headers: headers() }).then(handleResponse),

  createAccount: (body) =>
    fetch(`${API_BASE}/accounts`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  updateAccount: (id, body) =>
    fetch(`${API_BASE}/accounts/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),

  deleteAccount: (id) =>
    fetch(`${API_BASE}/accounts/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),

  // ── Reports ──────────────────────────────────────
  getDashboard: () =>
    fetch(`${API_BASE}/reports/dashboard`, { headers: headers() }).then(handleResponse),

  getMonthlyTrends: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/reports/trends?${qs}`, { headers: headers() }).then(handleResponse)
  },

  getCategoryReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/reports/categories?${qs}`, { headers: headers() }).then(handleResponse)
  },

  exportTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${API_BASE}/reports/export?${qs}`, { headers: headers() })
  },
}

export default api
