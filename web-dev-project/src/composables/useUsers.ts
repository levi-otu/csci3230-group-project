import { ref } from 'vue'

const API_URL = 'http://localhost:3000'

export interface UserRecord {
  id: number
  username: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  createdAt: string
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export function useUsers() {
  const users = ref<UserRecord[]>([])
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function listUsers(params: { role?: string; search?: string } = {}) {
    error.value = null
    isLoading.value = true
    try {
      const query = new URLSearchParams()
      if (params.role) query.set('role', params.role)
      if (params.search) query.set('search', params.search)
      const qs = query.toString()

      const res = await fetch(`${API_URL}/users${qs ? `?${qs}` : ''}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to load users'
        return []
      }
      users.value = data.users ?? []
      return users.value
    } catch {
      error.value = 'Unable to connect to server'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function changeRole(userId: number, role: string) {
    error.value = null
    try {
      const res = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to change role'
        return false
      }
      // Update local list
      const idx = users.value.findIndex((u) => u.id === userId)
      if (idx !== -1) users.value[idx].role = role as UserRecord['role']
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    }
  }

  async function deleteUser(userId: number) {
    error.value = null
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to delete user'
        return false
      }
      users.value = users.value.filter((u) => u.id !== userId)
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    }
  }

  return { users, error, isLoading, listUsers, changeRole, deleteUser }
}
