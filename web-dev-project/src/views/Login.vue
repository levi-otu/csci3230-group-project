<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const isLoading = ref(false)

function handleLogin() {
  isLoading.value = true
  // TODO: implement auth
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<template>
  <section class="hero is-fullheight login-page">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-4">
            <div class="has-text-centered mb-5">
              <img src="/tutor_sync.png" alt="TutorSync" class="login-logo mb-4" />
              <h1 class="title is-3 has-text-white">TutorSync</h1>
              <p class="subtitle is-6 has-text-grey-light">Sign in to your account</p>
            </div>

            <div class="box">
              <form @submit.prevent="handleLogin">
                <div class="field">
                  <label class="label">Email</label>
                  <div class="control has-icons-left">
                    <input
                      v-model="email"
                      class="input"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                    <span class="icon is-small is-left">
                      <i class="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>

                <div class="field">
                  <label class="label">Password</label>
                  <div class="control has-icons-left">
                    <input
                      v-model="password"
                      class="input"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                    <span class="icon is-small is-left">
                      <i class="fas fa-lock"></i>
                    </span>
                  </div>
                </div>

                <div class="field">
                  <label class="checkbox">
                    <input type="checkbox" />
                    Remember me
                  </label>
                </div>

                <div class="field">
                  <div class="control">
                    <button
                      class="button is-link is-fullwidth"
                      type="submit"
                      :class="{ 'is-loading': isLoading }"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p class="has-text-centered has-text-grey-light is-size-7 mt-4">
              Don't have an account?
              <a class="has-text-link-light">Contact your administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  background-color: #2c3040;
}

.login-logo {
  width: 80px;
  height: 80px;
}

.box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.box .input {
  background-color: #fff;
  color: #363636;
  border-color: #dbdbdb;
}

.box .input::placeholder {
  color: #b5b5b5;
}

.box .label {
  color: #363636;
}

.box .checkbox {
  color: #4a4a4a;
}

.button.is-link {
  background-color: #485fc7;
  transition: background-color 0.2s;
}

.button.is-link:hover {
  background-color: #3a51b9;
}
</style>
