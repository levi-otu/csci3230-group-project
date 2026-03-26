<template>
  <Codemirror 
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    style="height: 100%; overflow-y: auto !important;"
  />
</template>

<style scoped>
:deep(.cm-scroller){
  overflow-y: auto !important;
}
</style>

<script setup lang="ts">
import 'bulma/css/bulma.css'
import { EditorState } from '@codemirror/state'
import { ref, shallowRef } from 'vue';
import { javascript } from '@codemirror/lang-javascript';
import { Codemirror } from 'vue-codemirror';

const code = ref(`console.log('hello world')`);
const extensions = [javascript()];

</script>


    <!-- @ready="handleReady"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)" -->