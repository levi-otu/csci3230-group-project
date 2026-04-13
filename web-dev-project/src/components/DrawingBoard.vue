<script setup lang="ts">
import 'bulma/css/bulma.css'
import {onMounted, ref} from 'vue';
import { C } from 'vue-router/dist/options-BErt5RTe.cjs';

const canvasRef = ref<HTMLCanvasElement | null>(null);

// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

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
        ctx.strokeStyle = 'red';
            
        let drawing = false;
            
        function start(e : MouseEvent){
            console.log("start draw");
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


</script>

<template>
    <header class="pb-2">
        <h1 class="is-uppercase has-text-weight-bold is-size-4">Drawing Board</h1>
    </header>
    <canvas id="draw-canvas" ref="canvasRef" class="has-radius-normal"></canvas>
</template>

<style>
#draw-canvas {
    background-color: var(--bulma-white-ter);
    width: 100%;
    height: fit-content;
}
</style>