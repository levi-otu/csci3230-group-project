<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUsers, type UserRecord } from '@/composables/useUsers'
import { showToast } from '@/composables/useToast'

const { user: currentUser } = useAuth()
const { users, isLoading, listUsers, changeRole, deleteUser } = useUsers()

const searchQuery = ref('')
const roleFilter = ref('')
const showCreateModal = ref(false)
const newUsername = ref('')
const newEmail = ref('')
const newPassword = ref('')
const newRole = ref<'student' | 'instructor' | 'admin'>('student')
const isCreating = ref(false)

const filteredUsers = computed(() => {
  let result = users.value

  if (roleFilter.value) {
    result = result.filter((u) => u.role === roleFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(
      (u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }

  return result
})

function isSelf(u: UserRecord) {
  return currentUser.value?.id === u.id
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function roleBadgeClass(role: string) {
  switch (role) {
    case 'admin':
      return 'is-danger is-light'
    case 'instructor':
      return 'is-link is-light'
    default:
      return 'is-light'
  }
}

async function handleRoleChange(u: UserRecord, role: string) {
  const success = await changeRole(u.id, role)
  if (success) {
    showToast(`${u.username} is now ${role}`, 'success')
  } else {
    showToast('Failed to change role', 'error')
    await listUsers()
  }
}

async function handleDelete(u: UserRecord) {
  if (!confirm(`Delete user "${u.username}" permanently? This cannot be undone.`)) return
  const success = await deleteUser(u.id)
  if (success) {
    showToast(`${u.username} has been deleted`, 'info')
  } else {
    showToast('Failed to delete user', 'error')
  }
}

function openCreateModal() {
  newUsername.value = ''
  newEmail.value = ''
  newPassword.value = ''
  newRole.value = 'student'
  showCreateModal.value = true
}

async function handleCreate() {
  if (!newUsername.value.trim() || !newEmail.value.trim() || !newPassword.value) {
    showToast('All fields are required', 'warning')
    return
  }

  isCreating.value = true
  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername.value.trim(),
        email: newEmail.value.trim(),
        password: newPassword.value,
        role: newRole.value,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      showToast(data.error || 'Failed to create user', 'error')
      return
    }

    showToast(`${newUsername.value} created successfully`, 'success')
    showCreateModal.value = false
    await listUsers()
  } catch {
    showToast('Unable to connect to server', 'error')
  } finally {
    isCreating.value = false
  }
}

onMounted(() => listUsers())
</script>

<template>
  <main class="admin-page p-5">
    <header class="mb-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center">
        <div>
          <h1 class="title is-3">Admin Panel</h1>
          <p class="subtitle is-6">Manage users and platform settings</p>
        </div>
        <div class="is-flex is-align-items-center" style="gap: 0.75rem">
          <span class="tag is-medium is-rounded is-light">
            {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'user' : 'users' }}
          </span>
          <button class="button is-link" @click="openCreateModal">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Create User</span>
          </button>
        </div>
      </div>
    </header>

    <div class="filters mb-4">
      <div class="field is-grouped">
        <div class="control has-icons-left is-expanded">
          <input
            v-model="searchQuery"
            class="input"
            type="text"
            placeholder="Search by username or email..."
          />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>
        <div class="control">
          <div class="select">
            <select v-model="roleFilter">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div v-if="isLoading" class="has-text-centered p-5">
        <span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span>
      </div>

      <table v-else-if="filteredUsers.length" class="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th class="has-text-centered">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>
              <strong class="username-text">{{ u.username }}</strong>
              <span v-if="isSelf(u)" class="tag is-small is-link is-light ml-2">you</span>
            </td>
            <td>{{ u.email }}</td>
            <td>
              <span v-if="isSelf(u)" class="tag" :class="roleBadgeClass(u.role)">
                {{ u.role }}
              </span>
              <div v-else class="select is-small role-select">
                <select
                  :value="u.role"
                  @change="handleRoleChange(u, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </td>
            <td class="has-text-grey">{{ formatDate(u.createdAt) }}</td>
            <td class="has-text-centered">
              <button
                v-if="!isSelf(u)"
                class="delete-btn"
                title="Delete user"
                @click="handleDelete(u)"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="has-text-centered p-5">
        <p class="has-text-grey">No users found.</p>
      </div>
    </div>

    <!-- Create User Modal -->
    <div class="modal" :class="{ 'is-active': showCreateModal }">
      <div class="modal-background" @click="showCreateModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Create User</p>
          <button class="delete" aria-label="close" @click="showCreateModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Username</label>
            <div class="control has-icons-left">
              <input v-model="newUsername" class="input" type="text" placeholder="Username" />
              <span class="icon is-small is-left"><i class="fas fa-user"></i></span>
            </div>
          </div>
          <div class="field">
            <label class="label">Email</label>
            <div class="control has-icons-left">
              <input v-model="newEmail" class="input" type="email" placeholder="Email" />
              <span class="icon is-small is-left"><i class="fas fa-envelope"></i></span>
            </div>
          </div>
          <div class="field">
            <label class="label">Password</label>
            <div class="control has-icons-left">
              <input v-model="newPassword" class="input" type="password" placeholder="Password" />
              <span class="icon is-small is-left"><i class="fas fa-lock"></i></span>
            </div>
          </div>
          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="newRole">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-link"
            :class="{ 'is-loading': isCreating }"
            @click="handleCreate"
          >
            Create User
          </button>
          <button class="button" @click="showCreateModal = false">Cancel</button>
        </footer>
      </div>
    </div>
  </main>
</template>

<style scoped>
.admin-page {
  height: 100%;
  overflow-y: auto;
  background-color: hsl(0, 0%, 98%);
}

.admin-page .title {
  color: #2c3040 !important;
}

.admin-page .subtitle {
  color: #6b7080 !important;
}

.filters .input,
.filters .select select {
  background-color: #fff;
  color: #363636;
  border-color: #dbdbdb;
}

.filters .input::placeholder {
  color: #b5b5b5;
}

.table-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.table-card .table {
  margin-bottom: 0;
  background-color: transparent;
}

.table-card .table th {
  background-color: #f9fafb;
  color: #6b7080;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
}

.table-card .table td {
  color: #4a4a4a;
  vertical-align: middle;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.username-text {
  color: #2c3040;
}

.table-card .table tbody tr:hover {
  background-color: #f9fafb;
}

.table-card .table tbody tr:last-child td {
  border-bottom: none;
}

.role-select select {
  background-color: #fff;
  color: #363636;
  border-color: #e5e7eb;
  font-size: 0.85rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s;
}

.delete-btn:hover {
  color: #e74c3c;
  background-color: #fef2f2;
}

/* Modal overrides for light theme */
.modal-card-head,
.modal-card-foot {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.modal-card-title {
  color: #2c3040;
}

.modal-card-body {
  background-color: #fff;
}

.modal-card-body .label {
  color: #363636;
}

.modal-card-body .input,
.modal-card-body .select select {
  background-color: #fff;
  color: #363636;
  border-color: #dbdbdb;
}

.modal-card-body .input::placeholder {
  color: #b5b5b5;
}
</style>
