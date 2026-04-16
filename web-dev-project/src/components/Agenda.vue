<script setup lang="ts">
import 'bulma/css/bulma.css'
import { ref } from 'vue'
import AgendaListItem from './AgendaListItem.vue'

type AgendaItem = {
    id: number
    text: string
    completed: boolean
}

const props = defineProps<{
    items: AgendaItem[]
}>()

const emit = defineEmits<{
    add: [text: string]
    toggle: [id: number, nextValue: boolean]
    edit: [id: number, nextText: string]
    delete: [id: number]
}>()

const inputText = ref('')

const addItem = () => {
    const nextText = inputText.value.trim()
    if (nextText === '') {
        return
    }

    emit('add', nextText)
    inputText.value = ''
}

function forwardToggle(id: number, nextValue: boolean) {
    emit('toggle', id, nextValue)
}

function forwardEdit(id: number, nextText: string) {
    emit('edit', id, nextText)
}

</script>

<template>
    <div class="px-2 py-2 is-flex is-flex-direction-column" style="height: 100%">
        <header>
            <h1 class="is-uppercase has-text-weight-bold is-size-4">Agenda</h1>
        </header>
        
        <div id="agenda-list">
            <AgendaListItem
                            v-for="item in props.items"
              :key="item.id"
              :item="item"
                            @toggle="forwardToggle"
                            @edit="forwardEdit"
                            @delete="emit('delete', $event)"
            />
        </div>
        
        <div class="box p-0 mt-auto is-flex is-flex-direction-row has-background-black-ter"
            id="text-div">
            <textarea class="textarea has-fixed-size py-2"
                style="min-height: 2.5em;
                width: 95%;
                min-width: 0%;
                background: transparent;
                border: none;
                box-shadow: none;
                color: white;" 
                placeholder="Add new task..."
                @keydown.enter.exact.prevent="addItem"
                v-model="inputText">
            </textarea>

            <button id="text-button" class="has-background-grey-dark my-auto mx-2" v-on:click="addItem">+</button>
        </div>
    </div>
</template>

<style>
#text-div {
    border: 1px solid transparent;
    transition: 0.3s ease;
}

#text-div:hover {
    border-color: var(--bulma-info);
    /* border-radius: 2px; */
}

#text-button {
    height: 80%;
    aspect-ratio: 1/1;
    border-radius: 15px;
    /* border: 1px solid transparent; */
}

#text-button:hover{
    /* border-color: var(--bulma-info); */
    background-color: var(--bulma-info-light) !important;
    color: var(--bulma-black);
}

#agenda-list {
    flex-grow: 1;
    overflow-y: auto;
    min-height: 0;
    flex: 1;
}
</style>