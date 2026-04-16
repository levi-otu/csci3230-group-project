<script setup lang="ts">
import 'bulma/css/bulma.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type * as Y from 'yjs'
 
type Stroke = {
    points: { x: number; y: number }[]
    color: string
    size: number
    eraser: boolean
}


const props = defineProps<{
    ydrawing: Y.Array<Stroke>
}>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const contextRef = ref<CanvasRenderingContext2D | null>(null)
const drawing = ref(false)

const color = ref('#ffffff')
const brushSize = ref(3)
const isEraser = ref(false)
const toolbarPos = ref({ x: 20, y: 20 })

const cursorRef = ref<HTMLDivElement | null>(null);
const currentStroke = ref<Stroke | null>(null)
const cursorPos = ref({x: -100, y:-100})

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
    replayAllStrokes()
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

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length < 2) return
    ctx.save()
    ctx.strokeStyle = stroke.eraser ? '#0f172a' : stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    ctx.stroke()
    ctx.restore()
}
 
function replayAllStrokes() {
    const ctx = contextRef.value
    if (!ctx) return
    for (const stroke of props.ydrawing.toArray()) {
        drawStroke(ctx, stroke)
    }
}

function startDrawing(event: PointerEvent) {
    const canvas = canvasRef.value
    const ctx = contextRef.value
    if (!canvas || !ctx) return

    canvas.setPointerCapture(event.pointerId)
    drawing.value = true
    updateBrush()
    const point = getPointerPoint(event)
    currentStroke.value = {
        points: [point],
        color: color.value,
        size: brushSize.value,
        eraser: isEraser.value,
    }
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
}

function handleMouseMove(event: PointerEvent){
    draw(event);

    const point = getPointerPoint(event);
    cursorPos.value = {x: point.x, y: point.y};
}

function draw(event: PointerEvent) {
    if (!drawing.value) return
    const ctx = contextRef.value
    if (!ctx) return

    const point = getPointerPoint(event)
    currentStroke.value?.points.push(point)
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
    if (currentStroke.value && currentStroke.value.points.length > 1) {
        props.ydrawing.push([currentStroke.value])
    }
    currentStroke.value = null
    drawing.value = false
}

function clearCanvas() {
    props.ydrawing.delete(0, props.ydrawing.length)
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
 
    props.ydrawing.observe(() => {
        const ctx = contextRef.value
        if (!ctx) return
        const strokes = props.ydrawing.toArray()
        if (strokes.length > 0) {
            drawStroke(ctx, strokes[strokes.length - 1])
        }
    })
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
            <div id="brush-outline" :style="{
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderColor: isEraser ? `${color}` : 'white',
            }"></div>
            <div
                id="toolbar-div"
                class="box is-flex-direction-row is-flex is-align-items-center is-gap-2"
                :style="{ left: `${toolbarPos.x}px`, top: `${toolbarPos.y}px` }"
            >
                <p class="drag-handle" @mousedown="startDrag">⠿ Drag</p>
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
                @pointermove="handleMouseMove"
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
    cursor: none;
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
    resize: both;
    overflow: hidden;

    container-type: inline-size;

    height: 165px;
    width: 95px;

    min-width: 95px;
    min-height: 165px;
}

#toolbar-div > * {
    flex: 1 1 auto;
}

@container (max-width: 350px) {
    #toolbar-div .button.is-small {
        font-size: 0.65rem; 
        padding: 0 0.5rem;  
        height: 1.75em;     
    }

    #toolbar-div label {
        font-size: 0.7rem;
    }

    #toolbar-div input[type="color"] {
        width: 24px;
        height: 24px;
        padding: 0;
    }

    #toolbar-div input[type="range"] {
        max-width: 60px;
    }
    
    #toolbar-div .drag-handle {
        font-size: 0;
    }
    #toolbar-div .drag-handle::before {
        content: "⠿";
        font-size: 1rem;
    }
}

@container (max-width: 90px) {
    #toolbar-div label {
        display: none;
    }
}

.drag-handle {
        cursor: move;
        margin: 0;
}

#brush-outline {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    border: 1px solid white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}


</style>