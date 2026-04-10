<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import 'bulma/css/bulma.css'
import CodeEditor from '../components/CodeEditor.vue'
import Agenda from '@/components/Agenda.vue'

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

onMounted(() => {
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>



<template>
  <div class="work-session-layout has-background-white-bis p-2 m-0" ref="containerRef">
    <div class="left-column" ref="leftColumnRef" :style="{ width: `${leftWidth}%` }">
      <div class="has-background-dark has-radius-normal window left-top" :style="{ flex: `0 0 calc(${leftTopHeight}% - 13px)` }"><CodeEditor /></div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize left panels"
        @mousedown="startLeftRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window left-bottom" :style="{ flex: `0 0 calc(${100 - leftTopHeight}% - 13px)` }"><Agenda/></div>
    </div>

     <!--button fgor resizing , all have decided funxtion, you preolly have to define more if more column-->
    <button
      class="resize-handle"
      type="button"
      aria-label="Resize panels"
      @mousedown="startColumnResize"
    ></button>

    <div class="right-column" ref="rightColumnRef">
      <div class="has-background-dark has-radius-normal window right-top" :style="{ flex: `0 0 calc(${rightTopHeight}% - 13px)` }">Top Right Tab</div>
      <button
        class="resize-handle-row"
        type="button"
        aria-label="Resize right panels"
        @mousedown="startRightRowResize"
      ></button>
      <div class="has-background-dark has-radius-normal window right-bottom" :style="{ flex: `0 0 calc(${100 - rightTopHeight}% - 13px)` }">Bottom Right Tab</div>
    </div>
  </div>
</template>


<style>
.work-session-layout {
  height: 100%;
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
