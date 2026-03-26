<script setup lang="ts">
// import TheWelcome from '../components/TheWelcome.vue'
import 'bulma/css/bulma.css'
import CodeEditor from '../components/CodeEditor.vue'
</script>

<template>
  <!-- <main> -->
  <!-- <div class="dashboard-div is-fullwidth has-background-dark" style="min-height: 100vh">
    <div class="tile is-ancestor">
      <div class="is-parent">
        <div class="tile is-child has-background-dark window">
          ad
        </div>
      </div>
        <div class="tile is-child"></div>
    </div>
  </div> -->
  <!-- </main> -->
  <div class="columns is-2 is-multiline has-background-black-ter p-2 m-0" style="height: 100%">
    <div class="column is-half">
      <div class="has-background-dark  has-radius-normal window"><CodeEditor/></div>
    </div>
    <div class="column is-half">
      <div class="has-background-dark  has-radius-normal window">a</div>
    </div>
    <div class="column is-half">
      <div class="has-background-dark  has-radius-normal window">a</div>
    </div>
    <div class="column is-half">
      <div class="has-background-dark  has-radius-normal window">a</div>
    </div>
  </div>
</template>

<style>
.window {
  height: 100%;
  border: 3px solid var(--bulma-primary-05);
}
</style>
