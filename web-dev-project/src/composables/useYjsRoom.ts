import { ref, onBeforeUnmount, watch, type Ref } from 'vue'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const WS_URL = 'ws://localhost:3000'

export function useYjsRoom(roomId: Ref<string>) {
    
    //Shared Document
    const yDoc = new Y.Doc()
    const provider = ref<WebsocketProvider | null>(null)
    const connected = ref(false)


    //Panel Data
    const ytext = yDoc.getText('codemirror')
    const ychat = yDoc.getArray('chat')
    const ydrawing =  yDoc.getArray('drawing')
    const yagenda = yDoc.getArray('agenda')

    function connect(room:string){
        // Disconnect from current room if exists
        if (provider.value){
            provider.value.destroy()
            provider.value = null
            connected.value = false
        }

        //Prevent Connection to Invalid Room
        if (!room || room.trim() === ''){
            console.error('Invalid room name')
            return
        }

        //Create websocket connection
        const ws = new WebsocketProvider(WS_URL, room, yDoc)
        ws.on('status', (event:any) => {
            console.log('WebSocket status:', event.status)
            connected.value = event.status === 'connected'
        })
        provider.value = ws

    }

    //Connect now and when room changes
    watch(roomId, (next)=> connect(next), { immediate: true })

    onBeforeUnmount(() => {
        if (provider.value) {
            provider.value.destroy()
        }
        yDoc.destroy()
    })

    return {
        yDoc,
        provider,
        connected,
        ytext,
        ychat,
        ydrawing,
        yagenda
    }


}

