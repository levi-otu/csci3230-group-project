<template>
  <div class="editor-layout">
    <div class="toolbar">
      <div class="field is-grouped is-align-items-center m-0">
        <label class="label is-small m-0 mr-2" for="language-select">Language</label>
        <div class="select is-small">
          <select id="language-select" v-model="selectedLanguage">
            <option v-for="lang in languageOptions" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>
      </div>
       <div class="field is-grouped is-align-items-center m-0">
        <label class="label is-small m-0 mr-2" for="theme-select">Theme</label>
        <div class="select is-small">
          <select id="theme-select" v-model="selectedTheme">
            <option v-for="theme in themeOptions" :key="theme" :value="theme">{{ theme }}</option>
          </select>
        </div>
      </div>
      <button class="button is-link is-small" type="button" @click="runCode">Run</button>
    </div>

    <div class="work-area">
      <div class="editor-shell">
        <VueMonacoEditor
          v-model:value="code"
          :language="selectedLanguage"
          :theme="selectedTheme"
          :options="editorOptions"
          @mount="onEditorMount"
        />
      </div>

      <div class="output-shell">
        <p class="output-title">Run Output</p>
        <pre class="output-content">{{ output }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-layout {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.work-area {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 0.5rem;
}

.editor-shell {
  flex: 1;
  min-height: 0;
  border: 2px solid #6b7280;
  border-radius: 8px;
  overflow: hidden;
}

.output-shell {
  width: 34%;
  min-width: 220px;
  min-height: 0;
  border: 2px solid #6b7280;
  border-radius: 8px;
  background: #111827;
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
}

.output-title {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #374151;
  font-weight: 600;
}

.output-content {
  margin: 0;
  padding: 0.75rem;
  flex: 1;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.85rem;
}

:deep(.monaco-editor),
:deep(.monaco-editor .overflow-guard) {
  height: 100% !important;
}
</style>

<script setup lang="ts">
import 'bulma/css/bulma.css'
import { ref, shallowRef } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type * as Monaco from 'monaco-editor'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const code = ref(`function hello() {
  console.log("Hello, Monaco in Vue!")
}

hello()`)

const languageOptions = ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust'] as const
const themeOptions = ['vs-dark', 'light', 'hc-black',] as const
const selectedTheme = ref<(typeof themeOptions)[number]>('vs-dark')
const selectedLanguage = ref<(typeof languageOptions)[number]>('javascript')
const output = ref('Click Run to execute JavaScript/TypeScript code.')
const editorInstance = shallowRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
}


function onEditorMount(editor: Monaco.editor.IStandaloneCodeEditor) {
  editorInstance.value = editor
}


function runCode() {
    output.value = `Currently working on it: ${selectedLanguage.value}`;
    return;
}
</script>

