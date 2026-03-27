<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import 'bulma/css/bulma.css'

const sidebarOpen = ref(true)
</script>

<template>
  <div class="columns is-fullwidth is-gapless is-fluid" id="main-container">
    <div class="sidebar-column has-background-dark" :class="{ 'is-collapsed': !sidebarOpen }">
      <div class="sidebar-content">
        <Sidebar />
      </div>
      <button
        class="sidebar-toggle button is-small is-dark"
        @click="sidebarOpen = !sidebarOpen"
      >
        {{ sidebarOpen ? '◀' : '▶' }}
      </button>
    </div>

    <div class="column" id="content-column">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
#main-container {
  height: 100vh;
  width: 100vw;
}

#content-column {
  flex: 1 1 0;
  min-width: 0;
  overflow: auto;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  width: 200px;
  min-height: 100vh;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-column.is-collapsed {
  width: 40px;
}

.sidebar-content {
  flex: 1;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar-column.is-collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.sidebar-toggle {
  align-self: center;
  margin-bottom: 0.75rem;
  border: none;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.sidebar-toggle:hover {
  opacity: 1;
}
</style>
