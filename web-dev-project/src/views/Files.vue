<script setup lang="ts">
import 'bulma/css/bulma.css'
import { onMounted } from 'vue'
import { useDrawings } from '@/composables/useDrawings'

const { drawings, error, isLoading, listDrawings, downloadDrawing } = useDrawings()

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function filename(id: number) {
  return `drawing-${id}.png`
}

onMounted(listDrawings)
</script>

<template>
  <main class="files-page p-5">
    <h1 class="title">My Drawings</h1>

    <div v-if="error" class="notification is-danger is-light">{{ error }}</div>

    <div v-if="isLoading" class="has-text-centered p-5">
      <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
    </div>

    <div v-else-if="drawings.length === 0 && !error" class="has-text-grey">
      No drawings saved yet.
    </div>

    <div v-else class="drawings-grid">
      <div v-for="drawing in drawings" :key="drawing.id" class="drawing-card box">
        <div class="drawing-meta">
          <span class="drawing-id has-text-weight-semibold">Drawing #{{ drawing.id }}</span>
          <span v-if="drawing.sessionId" class="tag is-info is-light ml-2">Session {{ drawing.sessionId }}</span>
          <span v-else class="tag is-light ml-2">Standalone</span>
        </div>
        <p class="has-text-grey is-size-7 mt-1">{{ formatDate(drawing.createdAt) }}</p>
        <button
          class="button is-small is-link is-light mt-3"
          @click="downloadDrawing(drawing.id, filename(drawing.id))"
        >
          <span class="icon"><i class="fas fa-download"></i></span>
          <span>Download</span>
        </button>
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

.drawings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.drawing-card {
  display: flex;
  flex-direction: column;
}

.drawing-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
