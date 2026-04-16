<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import 'bulma/css/bulma.css'
import CodeEditor from '../components/CodeEditor.vue'
import Agenda from '@/components/Agenda.vue'
import { useSessions, type Session } from '@/composables/useSessions'
import { showToast } from '@/composables/useToast'
import Chat from '@/components/Chat.vue'
import { useAuth } from '@/composables/useAuth'
import DrawingBoard from '@/components/DrawingBoard.vue'
import CompletionChart from '@/components/CompletionChart.vue'
import { useYjsRoom } from '@/composables/useYjsRoom'

type AgendaItem = {
  id: number
  text: string
  completed: boolean
}

const route = useRoute()
const router = useRouter()
const { getSession } = useSessions()
const { user } = useAuth()

const roomMessage = ref('')
const agendaItems = ref<AgendaItem[]>([])

const currentRoomId = computed(() => {
  const roomId = route.params.roomId
  return typeof roomId === 'string' ? roomId : ''
})
const { yDoc, provider, connected, ytext, ychat, ydrawing, yagenda } = useYjsRoom(currentRoomId)

function syncAgenda() {
  agendaItems.value = yagenda.toArray()
}
yagenda.observe(syncAgenda)
syncAgenda()

function generateRoomId(): string {
  const randomChunk = Math.random().toString(36).slice(2, 8)
  const timeChunk = Date.now().toString(36).slice(-4)
  return `room-${randomChunk}${timeChunk}`
}

function sanitizeRoomId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

function goToRoom(roomId: string) {
  const normalized = sanitizeRoomId(roomId)
  if (!normalized) {
    return
  }

  router.push({
    name: 'work-session',
    params: { roomId: normalized },
  })
  roomMessage.value = ''
}

function createRoom() {
  goToRoom(generateRoomId())
}

async function copyRoomLink() {
  const roomId = currentRoomId.value
  if (!roomId) {
    return
  }

  const roomUrl = `${window.location.origin}/work-session/${roomId}`
  try {
    await navigator.clipboard.writeText(roomUrl)
    showToast('Room link copied to clipboard', 'success')
  } catch {
    showToast('Copy failed — use the browser URL bar to share', 'warning')
  }
}

function ensureRoomExists() {
  if (currentRoomId.value) {
    return
  }

  const nextRoomId = generateRoomId()
  router.replace({
    name: 'work-session',
    params: { roomId: nextRoomId },
  })
}

function addAgendaItem(text: string) {
  yagenda.push([{
    id: Date.now(),
    text,
    completed: false,
  }])
}

function toggleAgendaItem(id: number, nextValue: boolean) {
  const item = agendaItems.value.find((entry) => entry.id === id)
  if (!item) {
    return
  }
  item.completed = nextValue
}

function editAgendaItem(id: number, nextText: string) {
  const idx = yagenda.toArray().findIndex((entry) => entry.id === id)
  if (idx === -1) return
  const item = yagenda.get(idx)
  yagenda.delete(idx, 1)
  yagenda.insert(idx, [{ ...item, text: nextText }])
}

function deleteAgendaItem(id: number) {
  const idx = yagenda.toArray().findIndex((entry) => entry.id === id)
  if (idx === -1) return
  yagenda.delete(idx, 1)
}

const sessionId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

const session = ref<Session | null>(null)

const containerRef = ref<HTMLElement | null>(null)
const leftColumnRef = ref<HTMLElement | null>(null)
const rightColumnRef = ref<HTMLElement | null>(null)

const leftWidth = ref(50)
const leftTopHeight = ref(66)
const rightTopHeight = ref(50)

const MIN_LEFT_WIDTH = 15
const MAX_LEFT_WIDTH = 85
const MAX_TOP_WIDTH = 85
const MIN_TOP_WIDTH = 15

type ResizeAxis = 'x' | 'y'

type ResizeConfig = {
  axis: ResizeAxis,
  min: number,
  max: number,
  getBounds: () => DOMRect | null,
  apply: (nextValue: number) => void,
}

const activeResize = ref<ResizeConfig | null>(null)

//helper function to atleast have min and max values provided above
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function startResize(event: MouseEvent, config: ResizeConfig) {
  event.preventDefault()
  activeResize.value = config
}

function stopResize() {
  activeResize.value = null
}

function onResize(event: MouseEvent) {
  if (!activeResize.value) {
    return
  }

  const bounds = activeResize.value.getBounds()
  if (!bounds) {
    return
  }

  const size = activeResize.value.axis === 'x' ? bounds.width : bounds.height
  if (size <= 0) {
    return
  }

  const offset = activeResize.value.axis === 'x'
    ? event.clientX - bounds.left
    : event.clientY - bounds.top
  const nextValue = (offset / size) * 100
  activeResize.value.apply(clamp(nextValue, activeResize.value.min, activeResize.value.max))
}

function startColumnResize(event: MouseEvent) {
  startResize(event, {
    axis: 'x',
    min: MIN_LEFT_WIDTH,
    max: MAX_LEFT_WIDTH,
    getBounds: () => containerRef.value?.getBoundingClientRect() ?? null,
    apply: (nextValue) => {
      leftWidth.value = nextValue
    }
  })
}

function startLeftRowResize(event: MouseEvent) {
  startResize(event, {
    axis: 'y',
    min: MIN_TOP_WIDTH,
    max: MAX_TOP_WIDTH,
    getBounds: () => leftColumnRef.value?.getBoundingClientRect() ?? null,
    apply: (nextValue) => {
      leftTopHeight.value = nextValue
    }
  })
}

function startRightRowResize(event: MouseEvent) {
  startResize(event, {
    axis: 'y',
    min: MIN_TOP_WIDTH,
    max: MAX_TOP_WIDTH,
    getBounds: () => rightColumnRef.value?.getBoundingClientRect() ?? null,
    apply: (nextValue) => {
      rightTopHeight.value = nextValue
    }
  })
}

onMounted(async () => {
  ensureRoomExists()
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)

  if (sessionId.value !== null) {
    const result = await getSession(sessionId.value)
    if (result) session.value = result
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>



<template>
  <div class="work-session-wrapper">
    <header v-if="session" class="session-header">
      <div>
        <span class="session-topic-pill">{{ session.topic }}</span>
        <h2 class="session-header-title">{{ session.title }}</h2>
      </div>
      <span class="tag is-success" v-if="session.status === 'active'">Live</span>
      <span class="tag is-info" v-else-if="session.status === 'scheduled'">Scheduled</span>
      <span class="tag" v-else>{{ session.status }}</span>
    </header>
    <header v-else-if="sessionId !== null" class="session-header">
      <p class="has-text-grey">Loading session...</p>
    </header>

    <div class="room-bar px-3 py-2">
      <div class="room-meta">
        <span class="tag is-info is-light">Room: {{ currentRoomId }}</span>
      </div>
      <div class="room-actions field has-addons m-0">
        <p class="control">
          <button class="button is-small is-primary" type="button" @click="createRoom">New Room</button>
        </p>
        <p class="control">
          <button class="button is-small is-light" type="button" @click="copyRoomLink">Copy Link</button>
        </p>
      </div>
      <span v-if="roomMessage" class="room-message">{{ roomMessage }}</span>
    </div>

  <div class="work-session-layout has-background-white-bis p-2 m-0" ref="containerRef">
    <div class="left-column" ref="leftColumnRef" :style="{ width: `${leftWidth}%` }">
      <div class="has-background-dark has-radius-normal window left-top" :style="{ flex: `0 0 calc(${leftTopHeight}% - 13px)` }"><CodeEditor :ytext="ytext" :provider="provider" /></div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize left panels"
        @mousedown="startLeftRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window left-bottom" :style="{ flex: `0 0 calc(${100 - leftTopHeight}% - 13px)` }">
        <div class="agenda-chart-split">
          <div class="agenda-pane">
            <Agenda
              :items="agendaItems"
              @add="addAgendaItem"
              @toggle="toggleAgendaItem"
              @edit="editAgendaItem"
              @delete="deleteAgendaItem"
            />
          </div>
          <div class="chart-pane">
            <CompletionChart :items="agendaItems" />
          </div>
        </div>
      </div>
    </div>

     <!--button fgor resizing , all have decided funxtion, you preolly have to define more if more column-->
    <button
      class="resize-handle"
      type="button"
      aria-label="Resize panels"
      @mousedown="startColumnResize"
    ></button>

    <div class="right-column" ref="rightColumnRef">
      <div class="has-background-dark has-radius-normal window right-top" :style="{ flex: `0 0 calc(${rightTopHeight}% - 13px)` }"><DrawingBoard :ydrawing="ydrawing" /></div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize right panels"
        @mousedown="startRightRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window right-bottom" :style="{ flex: `0 0 calc(${100 - rightTopHeight}% - 13px)` }"><Chat :user="user?.username" :ychat="ychat" />
</div>
    </div>
  </div>
  </div>
</template>


<style>
.work-session-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: hsl(0, 0%, 98%);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
}

.session-topic-pill {
  display: inline-block;
  font-size: 0.7rem;
  color: #6b7080;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.15rem;
}

.session-header-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3040;
  margin: 0;
}

.room-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #dbdbdb;
  background-color: #fff;
}

.room-meta {
  min-width: 180px;
}

.room-actions {
  flex: 1;
  min-width: 280px;
}

.room-message {
  color: #4a4a4a;
  font-size: 0.9rem;
}

.work-session-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.left-column,
.right-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.right-column {
  flex: 1;
}

.left-top {
  min-height: 0;
}

.left-bottom {
  min-height: 120px;
}

.agenda-chart-split {
  height: 100%;
  min-height: 0;
  display: flex;
  gap: 0.5rem;
}

.agenda-pane {
  flex: 1;
  min-width: 0;
}

.chart-pane {
  flex: 0 0 200px;
  min-width: 160px;
}

.right-top,
.right-bottom {
  min-height: 120px;
}

.window {
  color: #fff;
  padding: 0.75rem;
  border: 3px solid var(--bulma-primary-05);
}

.resize-handle {
  width: 10px;
  min-width: 10px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #d5d8e2, #a6abbd);
  cursor: col-resize;
  padding: 0;
}

.resize-handle-row {
  height: 10px;
  min-height: 10px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #d5d8e2, #a6abbd);
  cursor: row-resize;
  padding: 0;
}

.resize-handle:hover {
  background: linear-gradient(180deg, #c3c8da, #8f96ad);
}

.resize-handle-row:hover {
  background: linear-gradient(180deg, #c3c8da, #8f96ad);
}
</style>
