<script setup lang="ts">
import 'bulma/css/bulma.css'
import {onMounted, ref} from 'vue';
// import { C } from 'vue-router/dist/options-BErt5RTe.cjs';
// import { pipeToNodeWritable } from 'vue/server-renderer';


const canvasRef = ref<HTMLCanvasElement | null>(null);

const color = ref('#000000');
const brushSize = ref(2);
const isEraser = ref(false);

const toolbarPos = ref({x:20, y:20});

onMounted(() => {
    // canvcanvasRefas = document.getElementById("#draw-canvas");

    const canvas = canvasRef.value;
    if(canvas){
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        console.log("TEST");

        function getMousePos(e: MouseEvent){
            const rect = canvas?.getBoundingClientRect();
            let x = null;

            return {
                x: e.clientX - rect!.left,
                y: e.clientY - rect!.top,
            }
        }
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
            
        let drawing = false;
            
        function start(e : MouseEvent){
            console.log("start draw");
            
            ctx.strokeStyle = color.value;
            drawing = true;
            draw(e);
        }
        
        function end(){
            drawing = false;
            ctx?.beginPath();
        }
        
        function draw(e : MouseEvent) {
            if(!drawing || !ctx) return;
            console.log("draw");
            const pos = getMousePos(e);
            ctx?.lineTo(pos.x,pos.y);
            ctx?.stroke();
            ctx?.beginPath();
            ctx?.moveTo(pos.x,pos.y);
        }
        
        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', end);
    }
});

function startDrag(e: MouseEvent){
    // if(e.target !==)
    const offsetX = e.clientX - toolbarPos.value.x;
    const offsetY = e.clientY - toolbarPos.value.y;

    const container = document.getElementById('canvas-div');
    const toolbar = document.getElementById('toolbar-div');
    if(!container || !toolbar) return;

    const drag = (moveEvent: MouseEvent) => {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
    
        const containerRect = container.getBoundingClientRect();
        const toolbarRect = toolbar.getBoundingClientRect();

        const maxX = containerRect.width - toolbarRect.width;
        const maxY = containerRect.height - toolbarRect.height;

        toolbarPos.value.x = Math.max(0, Math.min(x, maxX));
        toolbarPos.value.y = Math.max(0, Math.min(y, maxY));
    };

    const drop = () => {
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', drop);
    }

    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', drop)
}

</script>

<template>
    <header class="pb-2">
        <h1 class="is-uppercase has-text-weight-bold is-size-4">Drawing Board</h1>
    </header>
    <div id="canvas-div">
        <div id="toolbar-div" class="box is-flex-direction-row is-flex is-align-content-space-between is-gap-1 is-justify-content-center" @mousedown="startDrag" :style="{left: toolbarPos.x + 'px', top: toolbarPos.y + 'px'}">
            <p>⠿ Drag</p>
            <div class="field">
                <label>Color</label>
                <input type="color" v-model="color"></input>
            </div>
        </div>
        <canvas id="draw-canvas" ref="canvasRef" class="has-radius-normal"></canvas>
    </div>
</template>

<style>
#draw-canvas {
    background-color: var(--bulma-white-ter);
    width: 100%;
    height: 80%;
}

#canvas-div {
    height: 100%;
    width: 100%;
    position: relative;
}

#toolbar-div {
    position: absolute;
}
</style>