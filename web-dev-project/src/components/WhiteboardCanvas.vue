<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'


//I have to define custom draw and stop draw as cnavas was only responding to pointerdown , but not to the touch 

const canvasRef = ref<HTMLCanvasElement | null>(null)
const drawing = ref(false)
const contextRef = ref<CanvasRenderingContext2D | null>(null)

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const parent = canvas.parentElement
  if (!parent) {
    return
  }

  const { width, height } = parent.getBoundingClientRect()
  canvas.width = Math.max(1, Math.floor(width))
  canvas.height = Math.max(1, Math.floor(height))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = 2
  contextRef.value = ctx
}

function getPoint(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) {
    return { x: 0, y: 0 }
  }
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function getPointerPoint(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) {
    return { x: 0, y: 0 }
  }
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function startDrawing(event: PointerEvent) {
  const ctx = contextRef.value
  if (!ctx) {
    return
  }

  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  canvas.setPointerCapture(event.pointerId)
  drawing.value = true
  const point = getPointerPoint(event)
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
}

function draw(event: PointerEvent) {
  if (!drawing.value) {
    return
  }
  const ctx = contextRef.value
  if (!ctx) {
    return
  }
  const point = getPointerPoint(event)
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}

function stopDrawing(event: PointerEvent) {
  const canvas = canvasRef.value
  if (canvas?.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId)
  }
  drawing.value = false
}

function clearCanvas() {
  resizeCanvas()
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="canvas-wrapper">
    <div class="canvas-toolbar">
      <h2 class="is-size-6 has-text-weight-semibold m-0">Canvas</h2>
      <button class="button is-small is-light" type="button" @click="clearCanvas">Clear</button>
    </div>
    <canvas
      ref="canvasRef"
      class="draw-canvas"
      @pointerdown="startDrawing"
      @pointermove="draw"
      @pointerup="stopDrawing"
      @pointerleave="stopDrawing"
      @pointercancel="stopDrawing"
    />
  </div>
</template>

<style scoped>
.canvas-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draw-canvas {
  flex: 1;
  min-height: 0;
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  cursor: crosshair;
  touch-action: none;
}
</style>
