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
      <span class="tag is-small" :class="connected ? 'is-success' : 'is-warning'">
        {{ connected ? 'Connected' : 'Connecting...' }}
      </span>
      <button class="button is-link is-small" type="button" @click="runCode">Run</button>
    </div>

    <div class="work-area">
      <div class="editor-shell">
        <codemirror
          :extensions="baseExtensions"
          :style="{ height: '100%', fontSize: '14px' }"
          @ready="handleReady"
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

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  overflow: auto;
}
</style>

<script setup lang="ts">
import 'bulma/css/bulma.css'
import { ref, shallowRef, watch, onMounted } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { Compartment } from '@codemirror/state'
import * as Y from 'yjs'
import { yCollab } from 'y-codemirror.next'
import type { WebsocketProvider } from 'y-websocket'
import ts from 'typescript'

const props = defineProps<{
  ytext: Y.Text
  provider: WebsocketProvider | null
  connected: boolean
}>()


const languageOptions = ['javascript', 'typescript'] as const
const themeOptions = ['vs-dark', 'light'] as const
const selectedTheme = ref<(typeof themeOptions)[number]>('vs-dark')
const selectedLanguage = ref<(typeof languageOptions)[number]>('javascript')
const output = ref('Click Run to execute JavaScript/TypeScript code.')
const editorView = shallowRef<EditorView | null>(null)
const isRunning = ref(false)

const undoManager = new Y.UndoManager(props.ytext)

// Compartments allow reconfiguring language/theme without disrupting Yjs state
const langCompartment = new Compartment()
const themeCompartment = new Compartment()
const collabCompartment = new Compartment()

const baseExtensions = [
  EditorView.lineWrapping,
  collabCompartment.of([]),
  langCompartment.of(javascript()),
  themeCompartment.of(oneDark),
]

function handleReady({ view }: { view: EditorView }) {
  editorView.value = view
  if (props.provider) {
    view.dispatch({
      effects: collabCompartment.reconfigure(yCollab(props.ytext, props.provider.awareness, { undoManager })),
    })
  }
}

watch(() => props.provider, (p) => {
  if (p && editorView.value) {
    editorView.value.dispatch({
      effects: collabCompartment.reconfigure(yCollab(props.ytext, p.awareness, { undoManager })),
    })
  }
})

function getEditorSource() {
  return props.ytext.toString().trim()
}

function formatRunOutput(logs: string[], result?: unknown) {
  const renderedLogs = logs.join('\n')
  const renderedResult = result === undefined ? '' : `\nReturn value: ${String(result)}`
  const combined = `${renderedLogs}${renderedResult}`.trim()
  return combined || 'Code executed successfully with no output.'
}

function normalizeRuntimeError(error: unknown) {
  if (error instanceof Error) {
    return error.stack || `${error.name}: ${error.message}`
  }

  return String(error)
}

function transpileSource(source: string) {
  if (selectedLanguage.value !== 'typescript') {
    return source
  }

  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      strict: false,
    },
    reportDiagnostics: true,
  })

  if (result.diagnostics?.length) {
    const diagnostics = result.diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('\n')
    throw new Error(diagnostics)
  }

  return result.outputText
}

watch(selectedLanguage, (lang) => {
  editorView.value?.dispatch({
    effects: langCompartment.reconfigure(javascript({ typescript: lang === 'typescript' })),
  })
})

watch(selectedTheme, (theme) => {
  editorView.value?.dispatch({
    effects: themeCompartment.reconfigure(theme === 'vs-dark' ? oneDark : []),
  })
})

async function runCode() {
  const source = getEditorSource()

  if (!source) {
    output.value = 'Editor is empty.'
    return
  }

  isRunning.value = true
  output.value = `Running ${selectedLanguage.value}...`

  const logs: string[] = []
  const consoleProxy = {
    log: (...args: unknown[]) => logs.push(args.map((arg) => String(arg)).join(' ')),
    info: (...args: unknown[]) => logs.push(args.map((arg) => String(arg)).join(' ')),
    warn: (...args: unknown[]) => logs.push(`Warning: ${args.map((arg) => String(arg)).join(' ')}`),
    error: (...args: unknown[]) => logs.push(`Error: ${args.map((arg) => String(arg)).join(' ')}`),
  }

  try {
    const executableSource = transpileSource(source)
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
      ...args: string[]
    ) => (...fnArgs: unknown[]) => Promise<unknown>
    const runner = new AsyncFunction('console', 'globalThis', `${executableSource}`)
    const result = await runner(consoleProxy, globalThis)
    output.value = formatRunOutput(logs, result)
  } catch (error) {
    output.value = normalizeRuntimeError(error)
  } finally {
    isRunning.value = false
  }
}

</script>
