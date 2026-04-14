<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import BarChart from '@/components/charts/BarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import LineChart from '@/components/charts/LineChart.vue'

const { user } = useAuth()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const studentTopics = [
  { label: 'JS Basics', value: 8 },
  { label: 'CSS', value: 5 },
  { label: 'SVG', value: 3 },
  { label: 'D3', value: 2 },
  { label: 'Vue', value: 6 },
]

const studentHours = [
  { label: 'Wk 1', value: 2 },
  { label: 'Wk 2', value: 3.5 },
  { label: 'Wk 3', value: 5 },
  { label: 'Wk 4', value: 4 },
  { label: 'Wk 5', value: 6.5 },
  { label: 'Wk 6', value: 5.5 },
]

const instructorSessions = [
  { label: 'Wk 1', value: 4 },
  { label: 'Wk 2', value: 6 },
  { label: 'Wk 3', value: 5 },
  { label: 'Wk 4', value: 7 },
  { label: 'Wk 5', value: 8 },
  { label: 'Wk 6', value: 6 },
]

const instructorTopics = [
  { label: 'JavaScript', value: 12 },
  { label: 'Vue', value: 8 },
  { label: 'CSS/Bulma', value: 6 },
  { label: 'SVG/D3', value: 4 },
]

const adminRoles = [
  { label: 'Students', value: 42 },
  { label: 'Instructors', value: 8 },
  { label: 'Admins', value: 2 },
]

const adminActivity = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 15 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 19 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 5 },
]
</script>

<template>
  <main class="dashboard p-5">
    <header class="mb-5">
      <h1 class="title is-3">
        {{ greeting }}, {{ user?.username || 'Guest' }}
      </h1>
      <p class="subtitle is-6 has-text-grey">
        <span v-if="user?.role === 'admin'">Admin Dashboard</span>
        <span v-else-if="user?.role === 'instructor'">Instructor Dashboard</span>
        <span v-else-if="user?.role === 'student'">Student Dashboard</span>
        <span v-else>Welcome to TutorSync</span>
      </p>
    </header>

    <section v-if="user?.role === 'student'">
      <div class="columns is-multiline">
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Sessions Attended</p>
            <p class="stat-value">14</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Hours Studied</p>
            <p class="stat-value">26.5</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Topics Covered</p>
            <p class="stat-value">24</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Upcoming</p>
            <p class="stat-value">2</p>
          </div>
        </div>

        <div class="column is-7">
          <div class="chart-card">
            <BarChart title="Topics Covered" :data="studentTopics" color="#485fc7" />
          </div>
        </div>
        <div class="column is-5">
          <div class="chart-card">
            <LineChart title="Hours Studied per Week" :data="studentHours" color="#48c774" />
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="user?.role === 'instructor'">
      <div class="columns is-multiline">
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Sessions Taught</p>
            <p class="stat-value">36</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Active Students</p>
            <p class="stat-value">18</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Hours Tutored</p>
            <p class="stat-value">54</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Avg Rating</p>
            <p class="stat-value">4.8</p>
          </div>
        </div>

        <div class="column is-7">
          <div class="chart-card">
            <LineChart
              title="Sessions per Week"
              :data="instructorSessions"
              color="#485fc7"
            />
          </div>
        </div>
        <div class="column is-5">
          <div class="chart-card">
            <DonutChart title="Topics Taught" :data="instructorTopics" />
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="user?.role === 'admin'">
      <div class="columns is-multiline">
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Total Users</p>
            <p class="stat-value">52</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Active Sessions</p>
            <p class="stat-value">7</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Sessions Today</p>
            <p class="stat-value">22</p>
          </div>
        </div>
        <div class="column is-3">
          <div class="stat-card">
            <p class="stat-label">Uptime</p>
            <p class="stat-value">99.9%</p>
          </div>
        </div>

        <div class="column is-7">
          <div class="chart-card">
            <BarChart
              title="Sessions This Week"
              :data="adminActivity"
              color="#3298dc"
            />
          </div>
        </div>
        <div class="column is-5">
          <div class="chart-card">
            <DonutChart title="User Roles" :data="adminRoles" />
          </div>
        </div>
      </div>
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
  background-color: hsl(0, 0%, 98%);
}

.dashboard .title,
.dashboard .subtitle {
  color: #2c3040 !important;
}

.stat-card,
.chart-card {
  background-color: var(--bulma-dark);
  border-radius: 8px;
  padding: 1.25rem;
  border: 3px solid var(--bulma-primary-05);
}

.chart-card {
  height: 100%;
}

.stat-label {
  color: #9ca1b3;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.stat-value {
  color: #fff;
  font-size: 1.75rem;
  font-weight: 700;
}

.role-content {
  margin-top: 1rem;
}
</style>
