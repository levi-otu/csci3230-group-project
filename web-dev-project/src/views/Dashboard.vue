<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import 'bulma/css/bulma.css'
import CodeEditor from '../components/CodeEditor.vue'
import Agenda from '@/components/Agenda.vue'
import WhiteboardCanvas from '@/components/WhiteboardCanvas.vue'
import CompletionChart from '@/components/CompletionChart.vue'

type AgendaItem = {
  id: number
  text: string
  completed: boolean
}

const route = useRoute()
const router = useRouter()

const containerRef = ref<HTMLElement | null>(null)
const leftColumnRef = ref<HTMLElement | null>(null)
const rightColumnRef = ref<HTMLElement | null>(null)

const leftWidth = ref(50)
const leftTopHeight = ref(66)
const rightTopHeight = ref(50)

const MIN_LEFT_WIDTH = 20
const MAX_LEFT_WIDTH = 80
const MAX_TOP_WIDTH = 80
const MIN_TOP_WIDTH = 20

type ResizeAxis = 'x' | 'y'

//we keep track of the size of diff area
type ResizeConfig = {
  axis: ResizeAxis,
  min: number,
  max: number,
  getBounds: () => DOMRect | null,
  apply: (nextValue: number) => void,
}

const activeResize = ref<ResizeConfig | null>(null)
const roomMessage = ref('')
//keeping track of agenda, we manage the state here cause mutliple component use it
const agendaItems = ref<AgendaItem[]>([
])

const currentRoomId = computed(() => {
  const roomId = route.params.roomId
  return typeof roomId === 'string' ? roomId : ''
})

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
    name: 'dashboard',
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

  const roomUrl = `${window.location.origin}/dashboard/${roomId}`
  try {
    await navigator.clipboard.writeText(roomUrl)
    roomMessage.value = 'Room link copied'
  } catch {
    roomMessage.value = 'Copy failed. Use the browser URL bar to share.'
  }
}

function ensureRoomExists() {
  if (currentRoomId.value) {
    return
  }

  const nextRoomId = generateRoomId()
  router.replace({
    name: 'dashboard',
    params: { roomId: nextRoomId },
  })
}

//we can pas sthes function down in othe rocmponents to manage to do list

function addAgendaItem(text: string) {
  agendaItems.value.push({
    id: Date.now(),
    text,
    completed: false,
  })
}

function toggleAgendaItem(id: number, nextValue: boolean) {
  const item = agendaItems.value.find((entry) => entry.id === id)
  if (!item) {
    return
  }
  item.completed = nextValue
}

function editAgendaItem(id: number, nextText: string) {
  const item = agendaItems.value.find((entry) => entry.id === id)
  if (!item) {
    return
  }
  item.text = nextText
}

function deleteAgendaItem(id: number) {
  agendaItems.value = agendaItems.value.filter((entry) => entry.id !== id)
}



function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}


//resizing logic 
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

onMounted(() => {
  ensureRoomExists()
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>



<template>
  <div class="dashboard-page has-background-white-bis p-2 m-0">
    <div class="room-bar">
      <div class="room-meta">
        <span class="tag is-info is-light">Room: {{ currentRoomId }}</span>
      </div>
      <div class="room-actions field has-addons">
        <p class="control">
          <button class="button is-small is-primary" type="button" @click="createRoom">New Room</button>
        </p>
        <p class="control">
          <button class="button is-small is-light" type="button" @click="copyRoomLink">Copy Link</button>
        </p>
      </div>
      <span class="room-message" v-if="roomMessage">{{ roomMessage }}</span>
    </div>

    <div class="dashboard-layout" ref="containerRef">
    <div class="left-column" ref="leftColumnRef" :style="{ width: `${leftWidth}%` }">
      <div class="has-background-dark has-radius-normal window left-top" :style="{ flex: `0 0 calc(${leftTopHeight}% - 13px)` }">
        <CodeEditor :room-name="currentRoomId" /></div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize left panels"
        @mousedown="startLeftRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window left-bottom" :style="{ flex: `0 0 calc(${100 - leftTopHeight}% - 13px)` }">
        <Agenda
          :items="agendaItems"
          @add="addAgendaItem"
          @toggle="toggleAgendaItem"
          @edit="editAgendaItem"
          @delete="deleteAgendaItem"
        />
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
      <div class="has-background-dark has-radius-normal window right-top" :style="{ flex: `0 0 calc(${rightTopHeight}% - 13px)` }">
        <WhiteboardCanvas /></div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize right panels"
        @mousedown="startRightRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window right-bottom" :style="{ flex: `0 0 calc(${100 - rightTopHeight}% - 13px)` }">
        <!-- so are using same state for mutliple componmet so that's why it's up here-->
        <CompletionChart :items="agendaItems" /></div>
    </div>
    </div>
  </div>
</template>


<style>
.dashboard-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.room-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.room-meta {
  min-width: 180px;
}

.room-actions {
  flex: 1;
  min-width: 280px;
  margin-bottom: 0 !important;
}

.room-message {
  color: #4a4a4a;
  font-size: 0.9rem;
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
