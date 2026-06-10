import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

let authToken = localStorage.getItem('askmydoc_token') || null

export function setAuthToken(token) {
  authToken = token
}

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data
      const message =
        (data && (data.message || data.error)) ||
        `Request failed (${error.response.status})`
      return Promise.reject(new Error(message))
    }
    return Promise.reject(
      new Error('Cannot reach the server. Is the backend running?'),
    )
  },
)

export const authApi = {
  register: ({ name, email, password }) =>
    client.post('/auth/register', { name, email, password }).then((r) => r.data),

  login: ({ email, password }) =>
    client.post('/auth/login', { email, password }).then((r) => r.data),

  logout: () => client.post('/auth/logout').then((r) => r.data),

  getProfile: () => client.get('/users/profile').then((r) => r.data),
}

export const llmApi = {
  list: (userId) =>
    client.get(`/llm-provider/user/${userId}`).then((r) => r.data),

  add: (userId, payload) =>
    client.post(`/llm-provider/add-llm/user/${userId}`, payload).then((r) => r.data),

  update: (userId, llmId, payload) =>
    client.put(`/llm-provider/user/${userId}/${llmId}`, payload).then((r) => r.data),

  toggle: (userId, llmId) =>
    client.patch(`/llm-provider/user/${userId}/${llmId}/toggle`).then((r) => r.data),

  remove: (userId, llmId) =>
    client.delete(`/llm-provider/user/${userId}/${llmId}`).then((r) => r.data),
}

export default client
