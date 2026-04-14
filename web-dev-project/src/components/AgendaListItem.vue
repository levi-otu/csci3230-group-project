<script setup lang="ts">
import { ref } from 'vue'

type AgendaItem = {
  id: number
  text: string
  completed: boolean
}

const props = defineProps<{
  item: AgendaItem
}>()

const emit = defineEmits<{
  toggle: [id: number, nextValue: boolean]
  delete: [id: number]
  edit: [id: number, nextText: string]
}>()

const isEditing = ref(false)
const draftText = ref('')

function startEdit() {
  draftText.value = props.item.text
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  draftText.value = ''
}

function saveEdit() {
  const next = draftText.value.trim()
  if (!next) {
    cancelEdit()
    return
  }

  emit('edit', props.item.id, next)
  isEditing.value = false
}
</script>

<template>
  <div class="agenda-row is-flex is-align-items-center is-justify-content-space-between mb-2 px-2 py-2">
    <div class="is-flex is-align-items-center" style="gap: 0.5rem; min-width: 0; flex: 1;">
      <input
        type="checkbox"
        class="agenda-check"
        :checked="item.completed"
        @change="emit('toggle', item.id, ($event.target as HTMLInputElement).checked)"
      />

      <template v-if="!isEditing">
        <span :class="{ 'is-done': item.completed }" class="agenda-text">{{ item.text }}</span>
      </template>

      <template v-else>
        <input
          v-model="draftText"
          class="input is-small"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </template>
    </div>

    <div class="buttons are-small m-0" style="margin-left: 0.5rem;">
      <template v-if="!isEditing">
        <button class="button is-light" type="button" @click="startEdit">Edit</button>
        <button class="button is-danger is-light" type="button" @click="emit('delete', item.id)">Delete</button>
      </template>

      <template v-else>
        <button class="button is-primary is-light" type="button" @click="saveEdit">Save</button>
        <button class="button is-light" type="button" @click="cancelEdit">Cancel</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.agenda-row {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.agenda-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-done {
  text-decoration: overline;
  opacity: 0.7;
}
</style>
