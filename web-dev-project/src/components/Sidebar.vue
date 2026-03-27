<script setup lang="ts">
import 'bulma/css/bulma.css'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <aside class="sidebar-menu menu p-5 has-background-dark is-fullheight">
    <p class="menu-label has-text-grey-light is-size-7 mb-4">TutorSync</p>
    <ul class="menu-list">
      <li>
        <RouterLink to="/" :class="{ 'is-active': route.path === '/' }"> Dashboard </RouterLink>
      </li>
      <li>
        <RouterLink to="/work-session" :class="{ 'is-active': route.path === '/work-session' }">
          Work Session
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/files" :class="{ 'is-active': route.path === '/files' }">
          Files
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
  transition:
    background 0.2s,
    color 0.2s;
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
