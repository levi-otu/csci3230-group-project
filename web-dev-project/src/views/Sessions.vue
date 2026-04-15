<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useSessions, type Session } from '@/composables/useSessions'

const router = useRouter()
const { user } = useAuth()
const { sessions, error, isLoading, listSessions } = useSessions()

const activeTab = ref<'upcoming' | 'active' | 'past' | 'all'>('upcoming')

const canCreate = computed(
  () => user.value?.role === 'instructor' || user.value?.role === 'admin',
)

const filteredSessions = computed(() => {
  const now = new Date()
  return sessions.value.filter((s) => {
    const scheduled = new Date(s.scheduledAt)
    if (activeTab.value === 'upcoming') {
      return s.status === 'scheduled' && scheduled >= now
    }
    if (activeTab.value === 'active') return s.status === 'active'
    if (activeTab.value === 'past') {
      return s.status === 'completed' || s.status === 'cancelled'
    }
    return true
  })
})

function statusTagClass(status: Session['status']) {
  switch (status) {
    case 'scheduled':
      return 'is-info'
    case 'active':
      return 'is-success'
    case 'completed':
      return 'is-success is-light'
    case 'cancelled':
      return 'is-danger'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function openSession(id: number) {
  router.push(`/sessions/${id}`)
}

onMounted(() => {
  listSessions()
})
</script>

<template>
  <main class="sessions-page p-5">
    <header class="is-flex is-justify-content-space-between is-align-items-center mb-4">
      <div>
        <h1 class="title is-3">Sessions</h1>
        <p class="subtitle is-6 has-text-grey">Browse, join, and manage tutoring sessions</p>
      </div>
      <button
        v-if="canCreate"
        class="button is-link"
        @click="router.push('/sessions/new')"
      >
        <span class="icon"><i class="fas fa-plus"></i></span>
        <span>New Session</span>
      </button>
    </header>

    <div class="tabs is-boxed">
      <ul>
        <li :class="{ 'is-active': activeTab === 'upcoming' }">
          <a @click="activeTab = 'upcoming'">Upcoming</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'active' }">
          <a @click="activeTab = 'active'">Active</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'past' }">
          <a @click="activeTab = 'past'">Past</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'all' }">
          <a @click="activeTab = 'all'">All</a>
        </li>
      </ul>
    </div>

    <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

    <div v-if="isLoading" class="has-text-centered p-5">
      <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
    </div>

    <div v-else-if="filteredSessions.length === 0" class="empty-state">
      <p class="has-text-grey">No sessions to show.</p>
    </div>

    <div v-else class="session-grid">
      <article
        v-for="s in filteredSessions"
        :key="s.id"
        class="session-card"
        @click="openSession(s.id)"
      >
        <div class="card-header">
          <h2 class="session-title">{{ s.title }}</h2>
          <span class="tag" :class="statusTagClass(s.status)">{{ s.status }}</span>
        </div>
        <p class="session-topic">
          <span class="icon is-small"><i class="fas fa-tag"></i></span>
          {{ s.topic }}
        </p>
        <p class="session-meta">
          <span class="icon is-small"><i class="fas fa-clock"></i></span>
          {{ formatDate(s.scheduledAt) }} &middot; {{ s.durationMinutes }} min
        </p>
        <p class="session-meta">
          <span class="icon is-small"><i class="fas fa-user"></i></span>
          {{ s.creator?.username || 'Unknown' }}
        </p>
        <p class="session-meta">
          <span class="icon is-small"><i class="fas fa-users"></i></span>
          {{ s.participants?.length || 0 }}{{ s.maxParticipants ? ` / ${s.maxParticipants}` : '' }} participants
        </p>
      </article>
    </div>
  </main>
</template>

<style scoped>
.sessions-page {
  height: 100%;
  overflow-y: auto;
  background-color: hsl(0, 0%, 98%);
}

.sessions-page .title {
  color: #2c3040 !important;
}

.sessions-page .subtitle {
  color: #6b7080 !important;
}

.tabs.is-boxed li.is-active a {
  background-color: var(--bulma-dark);
  color: #fff;
  border-color: var(--bulma-dark);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  border: 1px dashed #dbdbdb;
}

.session-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.session-card {
  background-color: var(--bulma-dark);
  border: 3px solid var(--bulma-primary-05);
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  color: #fff;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.session-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.session-topic {
  color: #cfd2dc;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.session-meta {
  color: #9ca1b3;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.session-meta .icon {
  margin-right: 0.25rem;
}
</style>
