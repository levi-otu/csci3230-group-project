<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSessions, type Session } from '@/composables/useSessions'
import { showToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const {
  error,
  isLoading,
  getSession,
  deleteSession,
  joinSession,
  leaveSession,
  changeStatus,
} = useSessions()

const session = ref<Session | null>(null)

const sessionId = computed(() => Number(route.params.id))

const isOwner = computed(
  () => session.value !== null && user.value?.id === session.value.createdBy,
)
const isAdmin = computed(() => user.value?.role === 'admin')
const isStudent = computed(() => user.value?.role === 'student')
const canManage = computed(() => isOwner.value || isAdmin.value)

const isParticipant = computed(() => {
  if (!session.value || !user.value) return false
  return session.value.participants?.some((p) => p.id === user.value?.id) ?? false
})

const canJoin = computed(() => {
  if (!session.value) return false
  if (!isStudent.value) return false
  if (isParticipant.value) return false
  if (session.value.status === 'completed' || session.value.status === 'cancelled') return false
  if (
    session.value.maxParticipants &&
    (session.value.participants?.length ?? 0) >= session.value.maxParticipants
  ) {
    return false
  }
  return true
})

function statusTagClass(status: Session['status']) {
  switch (status) {
    case 'scheduled':
      return 'is-info'
    case 'active':
      return 'is-success'
    case 'completed':
      return 'is-light'
    case 'cancelled':
      return 'is-danger is-light'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function loadSession() {
  const result = await getSession(sessionId.value)
  if (result) session.value = result
}

async function handleStart() {
  const result = await changeStatus(sessionId.value, 'active')
  if (result) {
    showToast('Session started', 'success')
    await loadSession()
  } else {
    showToast(error.value || 'Failed to start session', 'error')
  }
}

async function handleEnd() {
  const result = await changeStatus(sessionId.value, 'completed')
  if (result) {
    showToast('Session ended', 'info')
    await loadSession()
  } else {
    showToast(error.value || 'Failed to end session', 'error')
  }
}

async function handleCancel() {
  if (!confirm('Cancel this session?')) return
  const result = await changeStatus(sessionId.value, 'cancelled')
  if (result) {
    showToast('Session cancelled', 'warning')
    await loadSession()
  } else {
    showToast(error.value || 'Failed to cancel session', 'error')
  }
}

async function handleDelete() {
  if (!confirm('Delete this session permanently? This cannot be undone.')) return
  const success = await deleteSession(sessionId.value)
  if (success) {
    showToast('Session deleted', 'info')
    router.push('/sessions')
  } else {
    showToast(error.value || 'Failed to delete session', 'error')
  }
}

async function handleJoin() {
  const success = await joinSession(sessionId.value)
  if (success) {
    showToast('You joined the session', 'success')
    await loadSession()
  } else {
    showToast(error.value || 'Failed to join session', 'error')
  }
}

async function handleLeave() {
  const success = await leaveSession(sessionId.value)
  if (success) {
    showToast('You left the session', 'info')
    await loadSession()
  } else {
    showToast(error.value || 'Failed to leave session', 'error')
  }
}

function openWorkspace() {
  router.push(`/work-session/${sessionId.value}`)
}

onMounted(loadSession)
</script>

<template>
  <main class="session-detail-page p-5">
    <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

    <div v-if="isLoading && !session" class="has-text-centered p-5">
      <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
    </div>

    <div v-else-if="session" class="detail-card">
      <header class="detail-header">
        <div>
          <p class="topic-pill">
            <span class="icon is-small"><i class="fas fa-tag"></i></span>
            {{ session.topic }}
          </p>
          <h1 class="title is-3 has-text-white">{{ session.title }}</h1>
          <p class="subtitle is-6 has-text-grey-light">
            Hosted by {{ session.creator?.username || 'Unknown' }}
          </p>
        </div>
        <span class="tag is-medium" :class="statusTagClass(session.status)">
          {{ session.status }}
        </span>
      </header>

      <div class="detail-body">
        <div class="meta-row">
          <div class="meta-item">
            <span class="meta-label">When</span>
            <span class="meta-value">{{ formatDate(session.scheduledAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Duration</span>
            <span class="meta-value">{{ session.durationMinutes }} minutes</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Participants</span>
            <span class="meta-value">
              {{ session.participants?.length || 0 }}{{ session.maxParticipants ? ` / ${session.maxParticipants}` : '' }}
            </span>
          </div>
        </div>

        <div v-if="session.description" class="description-block">
          <h3 class="block-title">Description</h3>
          <p>{{ session.description }}</p>
        </div>

        <div v-if="session.participants && session.participants.length > 0" class="participants-block">
          <h3 class="block-title">Participants</h3>
          <div class="participant-list">
            <span
              v-for="p in session.participants"
              :key="p.id"
              class="participant-chip"
            >
              <span class="icon is-small"><i class="fas fa-user"></i></span>
              {{ p.username }}
            </span>
          </div>
        </div>
      </div>

      <footer class="detail-actions">
        <button
          v-if="session.status === 'active' || session.status === 'scheduled'"
          class="button is-success"
          @click="openWorkspace"
        >
          <span class="icon"><i class="fas fa-laptop-code"></i></span>
          <span>Open Workspace</span>
        </button>

        <button
          v-if="canJoin"
          class="button is-link"
          @click="handleJoin"
        >
          <span class="icon"><i class="fas fa-sign-in-alt"></i></span>
          <span>Join Session</span>
        </button>

        <button
          v-if="isStudent && isParticipant"
          class="button is-warning"
          @click="handleLeave"
        >
          <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
          <span>Leave Session</span>
        </button>

        <button
          v-if="canManage && session.status === 'scheduled'"
          class="button is-success"
          @click="handleStart"
        >
          Start
        </button>

        <button
          v-if="canManage && session.status === 'active'"
          class="button is-info"
          @click="handleEnd"
        >
          End Session
        </button>

        <button
          v-if="canManage && (session.status === 'scheduled' || session.status === 'active')"
          class="button is-warning"
          @click="handleCancel"
        >
          Cancel
        </button>

        <button
          v-if="canManage"
          class="button"
          @click="router.push(`/sessions/${session.id}/edit`)"
        >
          <span class="icon"><i class="fas fa-edit"></i></span>
          <span>Edit</span>
        </button>

        <button
          v-if="canManage"
          class="button is-danger is-light"
          @click="handleDelete"
        >
          <span class="icon"><i class="fas fa-trash"></i></span>
          <span>Delete</span>
        </button>

        <button class="button is-text" @click="router.push('/sessions')">
          Back to list
        </button>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.session-detail-page {
  height: 100%;
  overflow-y: auto;
  background-color: hsl(0, 0%, 98%);
}

.session-detail-page .title {
  color: #fff !important;
}

.session-detail-page .subtitle {
  color: #cfd2dc !important;
}

.detail-card {
  background-color: var(--bulma-dark);
  border: 3px solid var(--bulma-primary-05);
  border-radius: 8px;
  padding: 2rem;
  max-width: 900px;
  color: #fff;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.topic-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #cfd2dc;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.detail-body {
  margin-bottom: 1.5rem;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #4a5063;
  border-bottom: 1px solid #4a5063;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.7rem;
  color: #9ca1b3;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
}

.meta-value {
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

.block-title {
  font-size: 0.8rem;
  color: #9ca1b3;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.description-block {
  margin-bottom: 1.5rem;
  color: #cfd2dc;
}

.participants-block {
  margin-bottom: 1rem;
}

.participant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.participant-chip {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  color: #cfd2dc;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #4a5063;
}
</style>
