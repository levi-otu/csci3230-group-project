<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <main class="dashboard p-5">
    <header class="mb-5">
      <h1 class="title is-3 has-text-white">
        {{ greeting }}, {{ user?.username || 'Guest' }}
      </h1>
      <p class="subtitle is-6 has-text-grey-light">
        <span v-if="user?.role === 'admin'">Admin Dashboard</span>
        <span v-else-if="user?.role === 'instructor'">Instructor Dashboard</span>
        <span v-else-if="user?.role === 'student'">Student Dashboard</span>
        <span v-else>Welcome to TutorSync</span>
      </p>
    </header>

    <section v-if="user?.role === 'admin'" class="role-content">
      <p class="has-text-grey-light">Admin content coming soon...</p>
    </section>

    <section v-else-if="user?.role === 'instructor'" class="role-content">
      <p class="has-text-grey-light">Instructor content coming soon...</p>
    </section>

    <section v-else-if="user?.role === 'student'" class="role-content">
      <p class="has-text-grey-light">Student content coming soon...</p>
    </section>

    <section v-else class="role-content">
      <p class="has-text-grey-light">Please sign in to view your dashboard.</p>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  height: 100%;
  overflow-y: auto;
}

.role-content {
  margin-top: 1rem;
}
</style>
