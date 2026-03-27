<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
</script>

<template>
  <aside class="sidebar-menu menu has-background-dark" :class="[collapsed ? 'p-2 is-collapsed' : 'p-4']">
    <ul class="menu-list">
      <li>
        <RouterLink to="/" :class="{ 'is-active': route.path === '/' }">
          <span class="icon"><i class="fas fa-tachometer-alt"></i></span>
          <span v-show="!collapsed" class="ml-2">Dashboard</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/work-session" :class="{ 'is-active': route.path === '/work-session' }">
          <span class="icon"><i class="fas fa-chalkboard-teacher"></i></span>
          <span v-show="!collapsed" class="ml-2">Work Session</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/files" :class="{ 'is-active': route.path === '/files' }">
          <span class="icon"><i class="fas fa-folder"></i></span>
          <span v-show="!collapsed" class="ml-2">Files</span>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar-menu .menu-list a {
  color: #b5b5b5;
  background: transparent;
  border-radius: 6px;
  padding: 0.6em 1em;
  margin-bottom: 0.4em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: var(--link-justify, flex-start);
  transition: background 0.2s, color 0.2s;
}

.sidebar-menu.is-collapsed .menu-list a {
  justify-content: center;
  padding: 0.6em 0;
  border-left: none;
}

.sidebar-menu.is-collapsed .menu-list a.is-active {
  border-left: none;
  padding-left: 0;
  background: rgba(255, 255, 255, 0.12);
}

.sidebar-menu .menu-list a:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-menu .menu-list a.is-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-left: 3px solid #485fc7;
  padding-left: calc(1em - 3px);
}
</style>
