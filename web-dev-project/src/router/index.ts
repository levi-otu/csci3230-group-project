import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import WorkSession from '../views/WorkSession.vue'
import Files from '../views/Files.vue'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'

type Role = 'admin' | 'instructor' | 'student'

declare module 'vue-router' {
  interface RouteMeta {
    hideLayout?: boolean
    requiresAuth?: boolean
    roles?: Role[]
  }
}

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
      meta: { requiresAuth: true },
    },
    {
      path: '/work-session',
      name: 'work-session',
      component: WorkSession,
      meta: { requiresAuth: true },
    },
    {
      path: '/files',
      name: 'files',
      component: Files,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAuth: true, roles: ['admin'] },
    },
  ],
})

router.beforeEach((to) => {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('token')
  const user = storedUser ? (JSON.parse(storedUser) as { role: Role }) : null
  const isAuthenticated = !!storedToken && !!user

  // Redirect authenticated users away from login
  if (to.name === 'login' && isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Require auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // Require role
  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
