<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessions } from '@/composables/useSessions'

const route = useRoute()
const router = useRouter()
const { error, isLoading, getSession, createSession, updateSession } = useSessions()

const TOPICS = [
  'JavaScript',
  'TypeScript',
  'Vue',
  'CSS / Bulma',
  'HTML / SVG',
  'D3 / Charts',
  'Node / Express',
  'Databases',
  'General',
]

const editingId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

const isEditing = computed(() => editingId.value !== null)

const title = ref('')
const description = ref('')
const topic = ref('General')
const scheduledAt = ref('')
const durationMinutes = ref(60)
const maxParticipants = ref<number | null>(null)

function toLocalInput(date: Date) {
  // Format as YYYY-MM-DDTHH:MM for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

onMounted(async () => {
  if (isEditing.value && editingId.value !== null) {
    const session = await getSession(editingId.value)
    if (session) {
      title.value = session.title
      description.value = session.description || ''
      topic.value = session.topic
      scheduledAt.value = toLocalInput(new Date(session.scheduledAt))
      durationMinutes.value = session.durationMinutes
      maxParticipants.value = session.maxParticipants
    }
  } else {
    // Default to 1 hour from now
    const next = new Date()
    next.setHours(next.getHours() + 1)
    next.setMinutes(0)
    scheduledAt.value = toLocalInput(next)
  }
})

async function handleSubmit() {
  const payload = {
    title: title.value,
    description: description.value || null,
    topic: topic.value,
    scheduledAt: new Date(scheduledAt.value).toISOString(),
    durationMinutes: durationMinutes.value,
    maxParticipants: maxParticipants.value,
  }

  if (isEditing.value && editingId.value !== null) {
    const updated = await updateSession(editingId.value, payload)
    if (updated) router.push(`/sessions/${updated.id}`)
  } else {
    const created = await createSession(payload)
    if (created) router.push(`/sessions/${created.id}`)
  }
}
</script>

<template>
  <main class="session-form-page p-5">
    <header class="mb-4">
      <h1 class="title is-3">{{ isEditing ? 'Edit Session' : 'New Session' }}</h1>
    </header>

    <div class="form-card">
      <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label class="label">Title</label>
          <div class="control">
            <input
              v-model="title"
              class="input"
              type="text"
              placeholder="e.g. Intro to Vue Reactivity"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Topic</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="topic" required>
                <option v-for="t in TOPICS" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <textarea
              v-model="description"
              class="textarea"
              placeholder="What will this session cover?"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">Scheduled At</label>
              <div class="control">
                <input
                  v-model="scheduledAt"
                  class="input"
                  type="datetime-local"
                  required
                />
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Duration (minutes)</label>
              <div class="control">
                <input
                  v-model.number="durationMinutes"
                  class="input"
                  type="number"
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Max Participants</label>
              <div class="control">
                <input
                  v-model.number="maxParticipants"
                  class="input"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="field is-grouped">
          <div class="control">
            <button
              type="submit"
              class="button is-link"
              :class="{ 'is-loading': isLoading }"
            >
              {{ isEditing ? 'Save Changes' : 'Create Session' }}
            </button>
          </div>
          <div class="control">
            <button type="button" class="button" @click="router.back()">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.session-form-page {
  height: 100%;
  overflow-y: auto;
  background-color: hsl(0, 0%, 98%);
}

.session-form-page .title {
  color: #2c3040 !important;
}

.form-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #dbdbdb;
  max-width: 720px;
}

.form-card :deep(.label) {
  color: #363636;
}

.form-card :deep(.input),
.form-card :deep(.textarea),
.form-card :deep(.select select) {
  background-color: #fff;
  color: #363636;
  border-color: #dbdbdb;
}

.form-card :deep(.input::placeholder),
.form-card :deep(.textarea::placeholder) {
  color: #b5b5b5;
}
</style>
