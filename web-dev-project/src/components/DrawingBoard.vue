<script setup lang="ts">
import 'bulma/css/bulma.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const contextRef = ref<CanvasRenderingContext2D | null>(null)
const drawing = ref(false)

const color = ref('#ffffff')
const brushSize = ref(3)
const isEraser = ref(false)
const toolbarPos = ref({ x: 20, y: 20 })

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
    ctx.strokeStyle = color.value
    ctx.lineWidth = brushSize.value
    contextRef.value = ctx
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

function updateBrush() {
    const ctx = contextRef.value
    if (!ctx) {
        return
    }

    ctx.lineWidth = brushSize.value
    ctx.strokeStyle = isEraser.value ? '#0f172a' : color.value
}

function startDrawing(event: PointerEvent) {
    const canvas = canvasRef.value
    const ctx = contextRef.value
    if (!canvas || !ctx) {
        return
    }

    canvas.setPointerCapture(event.pointerId)
    drawing.value = true
    updateBrush()
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
    const ctx = contextRef.value
    if (canvas?.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
    }
    if (ctx) {
        ctx.beginPath()
    }
    drawing.value = false
}

function clearCanvas() {
    resizeCanvas()
}

function toggleEraser() {
    isEraser.value = !isEraser.value
    updateBrush()
}

function startDrag(e: MouseEvent) {
    const offsetX = e.clientX - toolbarPos.value.x
    const offsetY = e.clientY - toolbarPos.value.y

    const container = document.getElementById('canvas-div')
    const toolbar = document.getElementById('toolbar-div')
    if (!container || !toolbar) {
        return
    }

    const drag = (moveEvent: MouseEvent) => {
        const x = moveEvent.clientX - offsetX
        const y = moveEvent.clientY - offsetY

        const containerRect = container.getBoundingClientRect()
        const toolbarRect = toolbar.getBoundingClientRect()

        const maxX = containerRect.width - toolbarRect.width
        const maxY = containerRect.height - toolbarRect.height

        toolbarPos.value.x = Math.max(0, Math.min(x, maxX))
        toolbarPos.value.y = Math.max(0, Math.min(y, maxY))
    }

    const drop = () => {
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('mouseup', drop)
    }

    window.addEventListener('mousemove', drag)
    window.addEventListener('mouseup', drop)
}

watch(color, () => {
    if (!isEraser.value) {
        updateBrush()
    }
})

watch(brushSize, updateBrush)

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
        <header class="pb-2">
            <h1 class="is-uppercase has-text-weight-bold is-size-4">Drawing Board</h1>
        </header>
        <div id="canvas-div">
            <div
                id="toolbar-div"
                class="box is-flex-direction-row is-flex is-align-items-center is-gap-2"
                @mousedown.self="startDrag"
                :style="{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }"
            >
                <p class="drag-handle">⠿ Drag</p>
                <div class="field m-0">
                    <label class="mr-1">Color</label>
                    <input type="color" v-model="color" />
                </div>
                <div class="field m-0">
                    <label class="mr-1">Size</label>
                    <input type="range" min="1" max="12" v-model.number="brushSize" />
                </div>
                <button class="button is-small" :class="isEraser ? 'is-warning' : 'is-light'" type="button" @click="toggleEraser">
                    {{ isEraser ? 'Eraser On' : 'Eraser Off' }}
                </button>
                <button class="button is-small is-light" type="button" @click="clearCanvas">Clear</button>
            </div>
            <canvas
                id="draw-canvas"
                ref="canvasRef"
                class="has-radius-normal"
                @pointerdown="startDrawing"
                @pointermove="draw"
                @pointerup="stopDrawing"
                @pointerleave="stopDrawing"
                @pointercancel="stopDrawing"
            ></canvas>
        </div>
    </div>
</template>

<style>
.canvas-wrapper {
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
}

#draw-canvas {
        background-color: #0f172a;
    width: 100%;
        height: 100%;
        touch-action: none;
}

#canvas-div {
    height: 100%;
    width: 100%;
    position: relative;
        min-height: 0;
}

#toolbar-div {
    position: absolute;
        z-index: 2;
        user-select: none;
        flex-wrap: wrap;
        max-width: calc(100% - 16px);
}

.drag-handle {
        cursor: move;
        margin: 0;
}
</style>