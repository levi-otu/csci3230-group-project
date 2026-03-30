<script setup lang="ts">
import 'bulma/css/bulma.css'
import {ref} from 'vue';

// function addItem(){
    
// }

const agendaList = ref([
    {id: 1, text: "list item 1", check:false},
]);

const inputText = ref('');

const addItem = () => {
    if (inputText.value.trim() == "") return;
    agendaList.value.push({
        id: Date.now(),
        text: inputText.value,
        check:false,
    })

    inputText.value = "";
}

//enter functions
// function sendMessage () {
//     addItem();
// }

</script>

<template>
    <div class="px-2 py-2 is-flex is-flex-direction-column" style="height: 100%">
        <header>
            <h1 class="is-uppercase has-text-weight-bold is-size-4">Agenda</h1>
        </header>
        
        <div id="agenda-list">
            <div v-for="item in agendaList" :key="item.id">
                <input type="checkbox" class="has-text-weight-semibold" v-model="item.check">{{item.text}}
            </div>
        </div>
        
        <div class="box p-0 mt-auto is-flex is-flex-direction-row has-background-black-ter"
            id="text-div">
            <textarea class="textarea has-fixed-size py-2"
                style="min-height: 2.5em;
                width: 95%;
                min-width: 0%;
                background: transparent;
                border: none;
                box-shadow: none;" 
                placeholder="Add new task..."
                @keydown.enter.exact.prevent="addItem"
                @keydown.enter.shift="handleNewLine"
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