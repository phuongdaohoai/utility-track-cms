import axios, { AxiosInstance } from 'axios'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  name: string
}

interface AuthResponse {
  user?: any
  token?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to headers if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const authService = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password } as LoginPayload),

  logout: (): void => {
    localStorage.removeItem('authToken')
  },

  register: (data: RegisterPayload) =>
    apiClient.post<AuthResponse>('/api/auth/register', data),

  getCurrentUser: () =>
    apiClient.get<AuthResponse>('/api/auth/me'),
}

export default authService
