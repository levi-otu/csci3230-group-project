<script setup lang="ts">
// import TheWelcome from '../components/TheWelcome.vue'
import 'bulma/css/bulma.css'
</script>

<template>
  <!-- <main> -->
  <!-- <TheWelcome /> -->
  <!-- <div class="column is-fullheight is-fullwidth has-background-dark"> -->
  <aside class="menu">
    <p class="menu-label">Tutor</p>
    <ul>
      <li><RouterLink to="/">Dashboard</RouterLink></li>
      <li><RouterLink to="/">Work Session</RouterLink></li>
      <li><RouterLink to="/">Files</RouterLink></li>
    </ul>
  </aside>
  <!-- </div> -->
  <!-- </main> -->
</template>
<style>
/* .column{

  } */
ul {
  display: flex;
  flex-direction: column;
  gap: 0.5vh;
}
</style>
