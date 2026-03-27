import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import WorkSession from '../views/WorkSession.vue'
import Files from '../views/Files.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { hideLayout: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/work-session',
      name: 'work-session',
      component: WorkSession,
    },
    {
      path: '/files',
      name: 'files',
      component: Files,
    },
  ],
})

export default router
