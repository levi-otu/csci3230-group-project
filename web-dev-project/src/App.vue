<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import 'bulma/css/bulma.css'

const route = useRoute()
const sidebarOpen = ref(true)
const hideLayout = computed(() => route.meta.hideLayout === true)
</script>

<template>
  <div id="app-layout" v-if="hideLayout">
    <RouterView />
  </div>

  <div id="app-layout" v-else>
    <nav class="navbar is-white" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="/">
          <img src="/tutor_sync.png" alt="TutorSync" class="navbar-logo" />
          <span class="has-text-weight-semibold ml-2">TutorSync</span>
        </a>
        <a
          class="navbar-burger"
          role="button"
          aria-label="menu"
          :class="{ 'is-active': sidebarOpen }"
          @click="sidebarOpen = !sidebarOpen"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item">
            <span class="icon-text has-text-success">
              <span class="icon"><i class="fas fa-circle fa-xs"></i></span>
              <span>LIVE COLLABORATION</span>
            </span>
          </div>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <span class="icon"><i class="fas fa-user"></i></span>
            <span class="ml-1">User</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="columns is-fullwidth is-gapless is-fluid" id="main-container">
      <div class="sidebar-column has-background-dark" :class="{ 'is-collapsed': !sidebarOpen }">
        <Sidebar :collapsed="!sidebarOpen" />
        <button
          class="sidebar-toggle button is-small is-dark"
          @click="sidebarOpen = !sidebarOpen"
        >
          <span class="icon">
            <i class="fas" :class="sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
          </span>
        </button>
      </div>

      <div class="column" id="content-column">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
#app-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.navbar-logo {
  max-height: 28px;
}

#main-container {
  flex: 1;
  min-height: 0;
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
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-column.is-collapsed {
  width: 48px;
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
