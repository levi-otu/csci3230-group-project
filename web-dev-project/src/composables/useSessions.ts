import { ref } from 'vue'

const API_URL = 'http://localhost:3000'

export interface SessionUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'instructor' | 'student'
}

export interface Session {
  id: number
  title: string
  description: string | null
  topic: string
  createdBy: number
  scheduledAt: string
  durationMinutes: number
  maxParticipants: number | null
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  creator?: SessionUser
  participants?: SessionUser[]
}

export interface SessionInput {
  title: string
  description?: string | null
  topic: string
  scheduledAt: string
  durationMinutes?: number
  maxParticipants?: number | null
}

interface ListParams {
  status?: string
  topic?: string
  mine?: boolean
  upcoming?: boolean
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export function useSessions() {
  const sessions = ref<Session[]>([])
  const session = ref<Session | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function listSessions(params: ListParams = {}) {
    error.value = null
    isLoading.value = true
    try {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.topic) query.set('topic', params.topic)
      if (params.mine) query.set('mine', 'true')
      if (params.upcoming) query.set('upcoming', 'true')
      const qs = query.toString()

      const res = await fetch(`${API_URL}/sessions${qs ? `?${qs}` : ''}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to load sessions'
        return []
      }
      sessions.value = data.sessions
      return data.sessions as Session[]
    } catch {
      error.value = 'Unable to connect to server'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function getSession(id: number) {
    error.value = null
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/sessions/${id}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to load session'
        return null
      }
      session.value = data.session
      return data.session as Session
    } catch {
      error.value = 'Unable to connect to server'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createSession(input: SessionInput) {
    error.value = null
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to create session'
        return null
      }
      return data.session as Session
    } catch {
      error.value = 'Unable to connect to server'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateSession(id: number, input: Partial<SessionInput>) {
    error.value = null
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/sessions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to update session'
        return null
      }
      return data.session as Session
    } catch {
      error.value = 'Unable to connect to server'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSession(id: number) {
    error.value = null
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/sessions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const data = await res.json()
        error.value = data.error || 'Failed to delete session'
        return false
      }
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function joinSession(id: number) {
    error.value = null
    try {
      const res = await fetch(`${API_URL}/sessions/${id}/join`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to join session'
        return false
      }
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    }
  }

  async function leaveSession(id: number) {
    error.value = null
    try {
      const res = await fetch(`${API_URL}/sessions/${id}/leave`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) {
        const data = await res.json()
        error.value = data.error || 'Failed to leave session'
        return false
      }
      return true
    } catch {
      error.value = 'Unable to connect to server'
      return false
    }
  }

  async function changeStatus(id: number, status: Session['status']) {
    error.value = null
    try {
      const res = await fetch(`${API_URL}/sessions/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || 'Failed to change status'
        return null
      }
      return data.session as Session
    } catch {
      error.value = 'Unable to connect to server'
      return null
    }
  }

  return {
    sessions,
    session,
    error,
    isLoading,
    listSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
    leaveSession,
    changeStatus,
  }
}
