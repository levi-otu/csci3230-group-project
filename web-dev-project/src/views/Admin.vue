<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <main class="admin-page p-5">
    <header class="mb-5">
      <h1 class="title is-3 has-text-white">Admin Panel</h1>
      <p class="subtitle is-6 has-text-grey-light">
        Signed in as {{ user?.username }} ({{ user?.role }})
      </p>
    </header>

    <section class="placeholder-card">
      <p class="has-text-grey-light">User management and platform controls coming soon...</p>
    </section>
  </main>
</template>

<style scoped>
.admin-page {
  height: 100%;
  overflow-y: auto;
  background-color: #2c3040;
}

.placeholder-card {
  background-color: #373b4d;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #4a5063;
}
</style>
