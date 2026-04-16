<script setup lang="ts">
import 'bulma/css/bulma.css'
import { onMounted, ref, computed } from 'vue'
import { useDrawings, type DrawingMeta } from '@/composables/useDrawings'

const {
  drawings,
  error: drawError,
  isLoading: drawLoading,
  listDrawings,
  downloadDrawing,
} = useDrawings()

type ViewMode = 'by-type' | 'by-session'
type FileType = 'drawings' | 'code' | 'agenda' | 'chatlogs'

const viewMode = ref<ViewMode>('by-type')
const activeFileType = ref<FileType>('drawings')
const selectedSessionId = ref<string | null>(null)

const isLoading = computed(() => drawLoading.value)
const error = computed(() => drawError.value)

const drawingsBySession = computed(() => {
  const map = new Map<string | null, DrawingMeta[]>()
  for (const d of drawings.value) {
    const key = d.sessionId ?? null
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return map
})

const sessionGroups = computed(() => {
  const groups: Array<{ id: string | null; label: string; drawingCount: number }> = []

  for (const [sid, drawingList] of drawingsBySession.value) {
    if (sid === null) continue
    groups.push({ id: sid, label: sid, drawingCount: drawingList.length })
  }

  const standaloneCount = drawingsBySession.value.get(null)?.length ?? 0
  if (standaloneCount > 0) {
    groups.push({ id: null, label: 'Standalone', drawingCount: standaloneCount })
  }

  return groups
})

const selectedSessionDrawings = computed(
  () => drawingsBySession.value.get(selectedSessionId.value) ?? [],
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function downloadName(drawing: DrawingMeta) {
  return drawing.fileName ? `${drawing.fileName}.png` : `drawing-${drawing.id}.png`
}

onMounted(async () => {
  await listDrawings()
})
</script>

<template>
  <main class="files-page p-5">
    <h1 class="title">My Files</h1>

    <div v-if="error" class="notification is-danger is-light mb-4">{{ error }}</div>

    <div class="tabs is-boxed mb-1">
      <ul>
        <li :class="{ 'is-active': viewMode === 'by-type' }">
          <a @click="viewMode = 'by-type'">By File Type</a>
        </li>
        <li :class="{ 'is-active': viewMode === 'by-session' }">
          <a @click="viewMode = 'by-session'">By Session</a>
        </li>
      </ul>
    </div>

    <div v-if="viewMode === 'by-type'" class="by-type-panel">
      <div class="tabs is-boxed mb-4">
        <ul>
          <li :class="{ 'is-active': activeFileType === 'drawings' }">
            <a @click="activeFileType = 'drawings'">Drawings</a>
          </li>
          <li :class="{ 'is-active': activeFileType === 'code' }">
            <a @click="activeFileType = 'code'">Code</a>
          </li>
          <li :class="{ 'is-active': activeFileType === 'agenda' }">
            <a @click="activeFileType = 'agenda'">Agenda</a>
          </li>
          <li :class="{ 'is-active': activeFileType === 'chatlogs' }">
            <a @click="activeFileType = 'chatlogs'">Chat Logs</a>
          </li>
        </ul>
      </div>

      <div v-if="isLoading" class="has-text-centered p-5">
        <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
      </div>

      <template v-else-if="activeFileType === 'drawings'">
        <div v-if="drawings.length === 0 && !error" class="has-text-grey">
          No drawings saved yet.
        </div>
        <div v-else class="drawings-grid">
          <div v-for="drawing in drawings" :key="drawing.id" class="drawing-card box">
            <div class="drawing-meta">
              <span class="drawing-id has-text-weight-semibold">Drawing #{{ drawing.id }}</span>
              <span v-if="drawing.sessionId" class="tag is-info is-light ml-2">
                Session {{ drawing.sessionId }}
              </span>
              <span v-else class="tag is-light ml-2">Standalone</span>
            </div>
            <p v-if="drawing.fileName" class="has-text-grey is-size-7 mt-1">
              <span class="icon-text">
                <span class="icon"><i class="fas fa-folder"></i></span>
                <span>{{ drawing.fileName }}</span>
              </span>
            </p>
            <p class="has-text-grey is-size-7 mt-1">{{ formatDate(drawing.createdAt) }}</p>
            <button
              class="button is-small is-link is-light mt-3"
              @click="downloadDrawing(drawing.id, downloadName(drawing))"
            >
              <span class="icon"><i class="fas fa-download"></i></span>
              <span>Download</span>
            </button>
          </div>
        </div>
      </template>

      <div v-else class="placeholder-panel">
        <span class="icon is-large has-text-grey-light mb-3">
          <i class="fas fa-folder-open fa-2x"></i>
        </span>
        <p class="has-text-grey">No {{ activeFileType }} saved yet.</p>
      </div>
    </div>

    <div v-else class="by-session-panel">
      <div v-if="isLoading" class="has-text-centered p-5">
        <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
      </div>

      <div v-else class="session-layout">
        <aside class="session-list">
          <p class="menu-label">Sessions</p>
          <p v-if="sessionGroups.length === 0" class="has-text-grey is-size-7 px-2">
            No files saved yet.
          </p>
          <ul v-else class="menu-list">
            <li v-for="group in sessionGroups" :key="group.id ?? 'standalone'">
              <a
                :class="{ 'is-active': selectedSessionId === group.id }"
                @click="selectedSessionId = group.id"
              >
                <span>{{ group.label }}</span>
                <span class="tag is-light is-small ml-auto">{{ group.drawingCount }}</span>
              </a>
            </li>
          </ul>
        </aside>

        <div class="session-content">
          <section class="content-section">
            <p class="content-section-title">
              <span class="icon mr-1"><i class="fas fa-paint-brush"></i></span> Drawings
            </p>
            <div v-if="selectedSessionDrawings.length === 0" class="has-text-grey is-size-7">
              No drawings for this session.
            </div>
            <div v-else class="drawings-grid">
              <div
                v-for="drawing in selectedSessionDrawings"
                :key="drawing.id"
                class="drawing-card box"
              >
                <div class="drawing-meta">
                  <span class="drawing-id has-text-weight-semibold">Drawing #{{ drawing.id }}</span>
                </div>
                <p v-if="drawing.fileName" class="has-text-grey is-size-7 mt-1">
                  <span class="icon-text">
                    <span class="icon"><i class="fas fa-folder"></i></span>
                    <span>{{ drawing.fileName }}</span>
                  </span>
                </p>
                <p class="has-text-grey is-size-7 mt-1">{{ formatDate(drawing.createdAt) }}</p>
                <button
                  class="button is-small is-link is-light mt-3"
                  @click="downloadDrawing(drawing.id, downloadName(drawing))"
                >
                  <span class="icon"><i class="fas fa-download"></i></span>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </section>

          <section class="content-section">
            <p class="content-section-title">
              <span class="icon mr-1"><i class="fas fa-code"></i></span> Code
            </p>
            <p class="has-text-grey is-size-7">No code saved for this session.</p>
          </section>

          <section class="content-section">
            <p class="content-section-title">
              <span class="icon mr-1"><i class="fas fa-list-check"></i></span> Agenda
            </p>
            <p class="has-text-grey is-size-7">No agenda saved for this session.</p>
          </section>

          <section class="content-section">
            <p class="content-section-title">
              <span class="icon mr-1"><i class="fas fa-comments"></i></span> Chat Logs
            </p>
            <p class="has-text-grey is-size-7">No chat logs saved for this session.</p>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.files-page {
  height: 100%;
  overflow-y: auto;
  background-color: hsl(0, 0%, 98%);
}

.tabs.is-boxed li.is-active a {
  background-color: var(--bulma-dark);
  color: #fff;
  border-color: var(--bulma-dark);
}

.by-type-panel {
  padding-top: 0;
}

.by-session-panel {
  padding-top: 1rem;
}

.session-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.session-list {
  flex: 0 0 220px;
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  padding: 0.75rem;
  position: sticky;
  top: 0;
}

.session-list .menu-list a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #4a4a4a;
  cursor: pointer;
}

.session-list .menu-list a:hover {
  background-color: #f5f5f5;
}

.session-list .menu-list a.is-active {
  background-color: hsl(217, 71%, 53%);
  color: #fff;
}

.session-list .menu-list a.is-active .tag {
  background-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.session-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-section {
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  padding: 1rem;
}

.content-section-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  color: #363636;
}

.drawings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.drawing-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
}

.drawing-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.placeholder-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: #b5b5b5;
}
</style>
