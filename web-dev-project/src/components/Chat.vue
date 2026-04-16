<script setup lang="ts">
import 'bulma/css/bulma.css'
import {ref} from 'vue';
import type * as Y from 'yjs'

type ChatMessage = {
    user: string;
    text: string;
    timestamp: number;
}

const props = defineProps<{
    user?: string
    ychat: Y.Array<ChatMessage>
}>()

const chatList = ref<ChatMessage[]>([])

// Keep local list in sync with Yjs array
function syncFromYjs() {
    chatList.value = props.ychat.toArray()
}
props.ychat.observe(syncFromYjs)
syncFromYjs()

const inputText = ref('');

const enterChat = () => {
    if (inputText.value.trim() === '') return
    const username = props.user || 'Anonymous'
    props.ychat.push([{
        user: username,
        text: inputText.value,
        timestamp: Date.now(),
    }])
    inputText.value = ''
}

function handleNewLine() {
    inputText.value += '\n'
}



</script>

<template>
    <div class="px-2 is-flex is-flex-direction-column" style="height: 100%">
        <header>
            <h1 class="is-uppercase has-text-weight-bold is-size-4">Chat</h1>
        </header>

        <div id="chat-box" class="my-2 has-radius-normal p-2" >
            <template v-if="chatList.length > 0">
                <div v-for="item in chatList.slice().reverse()">
                    <span class="has-text-info">{{item.user}}: {{item.text}}</span>
                </div>
            </template>
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
                placeholder="Message..."
                @keydown.enter.exact.prevent="enterChat"
                @keydown.enter.shift="handleNewLine"
                v-model="inputText">
            </textarea>

            <button id="text-button" class="has-background-grey-dark my-auto mx-2" v-on:click="enterChat">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" height="1.25rem" width="1.25rem">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>

            </button>
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

#chat-box {
    /* flex-grow: 1; */
    display: flex;
    overflow-y: auto;
    min-height: 0;
    flex: 1;
    flex-direction: column-reverse;
    background-color: var(--bulma-black-ter);
}
#chat-box::before {
    content: "";
    flex: 1; 
}
</style>