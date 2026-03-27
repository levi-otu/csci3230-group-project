import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const API_URL = 'http://localhost:3000'

interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'instructor' | 'student'
}

const user = ref<User | null>(null)
const token = ref<string | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)

// Restore session from localStorage on load
const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')
if (storedToken && storedUser) {
  token.value = storedToken
  user.value = JSON.parse(storedUser)
}

export function useAuth() {
  const router = useRouter()
  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    error.value = null
    isLoading.value = true

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        error.value = data.error || 'Login failed'
        return false
      }

      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(username: string, email: string, password: string) {
    error.value = null
    isLoading.value = true

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        error.value = data.error || 'Registration failed'
        return false
      }

      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return {
    user,
    token,
    error,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
