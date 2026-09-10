<script setup>
    import {ref, onMounted, nextTick, inject} from 'vue';
    import {gsap} from 'gsap';
    import buttonSource from "../assets/button.mp3"
    import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
    import { chatManager } from "../stores/chatManager"

    const chatStore = chatManager()


    let nickname = 'Anonyme';
    const buttonSound = new Audio(buttonSource);
    const gifs = ref({});
    

    async function LoadPseudo() {
        const reponse = await fetch('/pseudos.json');
        const data = await reponse.json();
        nickname = data.pseudos[Math.floor(Math.random() * data.pseudos.length)];

        console.log("Nickname :" + nickname)

        localStorage.setItem("nickname", nickname)
    }

    const ws = inject("ws")

    console.log("On a injecté et ça a donnée ça :", ws)

    onMounted (async() => {
        await LoadGif()
        if (localStorage.getItem("nickname") === null) {
            await LoadPseudo()
        } else {
            nickname = localStorage.getItem("nickname")
            console.log("Nickname :" + nickname)
        }

        ws.addEventListener('open', () => {
            console.log('Connecté au serveur Websocket');
        });

        ws.addEventListener('message', receiveMessage);
    })
    


    const chatBox = ref(null);
    const messages = ref([]);
    const messageText = ref('');

    function receiveMessage(event) {
        const data  = JSON.parse(event.data);
  
        const messageDate = new Date(data.timestamp);
        const hours = messageDate.getHours().toString().padStart(2, '0');
        const minutes = messageDate.getMinutes().toString().padStart(2, '0');
        const displayedTime = hours + ':' + minutes;

        const id = Date.now() + Math.random();

        messages.value.push({
            id,
            nickname: data.nickname,
            text: data.text,
            type: data.type,
            gifUrl: data.gifUrl,
            time: displayedTime
        });

        nextTick (() => {
            if (chatBox.value) {
                chatBox.value.scrollTo({
                    top: chatBox.value.scrollHeight,
                    behavior: 'smooth'
                });
            }
        });

        setTimeout(() => {
            messages.value = messages.value.filter(m => m.id !== id);
        }, 60000);
    }

    let messageInputFocused = false

    function sendMessage() {
        const text = messageText.value;
        const timestamp = Date.now();

        if (text.startsWith("/gif")) {
            const gifName = text.replace('/gif ', '').trim()
            const gifUrl = gifs.value[gifName]

            if (gifUrl) {
                const data = JSON.stringify({
                    nickname: nickname, 
                    type: "gif",
                    gifUrl: gifs.value[gifName],
                    timestamp : timestamp
                })
                socket.send(data);
                messageText.value = '';
            }
        }
    
        if (text !== '' && text.length <= 1000 && ws) {
            buttonSound.currentTime = 0;
            buttonSound.play();
    
           
            const data = JSON.stringify({nickname : nickname, text: text, timestamp: timestamp })
            console.log("WS donne", ws)
            console.log("Data donne", data)
            ws.send(data);
            messageText.value = '';
        }
    };

    function messageInputFocus() {
        console.log("Focus")
        messageInputFocused = true
    }

    

    document.addEventListener('keydown', (e) => {

        buttonSound.currentTime = 0; 
        
        if (messageInputFocused) {
            buttonSound.play();
        }
    });

    function openChatAnim(el, done) {
        gsap.fromTo(el, 
            { opacity: 0, y: 200 },
            {
                duration: 0.3,
                ease: "power4.out",
                opacity: 1,
                y: 0,
                onComplete: done
            }
        );
    }

    function closeChatAnim(el, done) {
        gsap.to(el, {
          duration : 0.3,
          ease : "power4.out",
          opacity : 0,
          y : 200,
          onComplete: done
      })
    }

    function newMessageAnim(el, done) {
        gsap.fromTo(el, 
            { opacity: 0, y: 200 },
            {
                duration: 0.3,
                ease: "power4.out",
                opacity: 1,
                y: 0,
                onComplete: done
            }
        );

        buttonSound.play()
    }

    function chooseColor(nickname) {
        if (nickname === "Bot") {
            return "color: #5ab2fa;"    
        } else {
            return "color: #FFBF00;"
        }
    }

    async function LoadGif() {
        const reponse = await fetch('/gifs.json')
        const data = await reponse.json();
        gifs.value = data.gifs;
    }
    

</script>

<template>

    <Transition @enter="openChatAnim" @leave="closeChatAnim" :css="false">
    
    <div id="chatZone" v-if="chatStore.chatOpened">
        <div id="chatBox" ref="chatBox" class="white">
            <div id="messages">
                <TransitionGroup @enter="newMessageAnim" :css="false">
                <p v-for="msg in messages" :key="msg.id">
                    <span :style="chooseColor(msg.nickname)">{{ msg.nickname }}, </span>
                    <span style="opacity: 0.5; font-size: 0.8em;">{{ msg.time }}</span>
                    <img v-if="msg.type === 'gif'" :src="msg.gifUrl" alt="">
                    <span v-else>{{ msg.text }}</span>
                    
                </p>
                </TransitionGroup>
            </div>
        </div>

        <div id="chatBottom" class="white">
            <input type="text" id="messageInput" placeholder="Votre message" v-model="messageText" @keyup.enter="sendMessage" @focus="messageInputFocused = true" @blur="messageInputFocused = false">
            <PhPaperPlaneTilt @click="sendMessage" :size="28" weight="fill" style="cursor: pointer;" />
        </div>
        
    </div>

    </Transition>

</template>

<style>

#chatZone {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap : 10px;

    position: fixed;
    bottom: 150px;

    z-index: -1;
}

#chatBox {
    width: 280px;
    height: 350px;
    overflow-y: auto;
    background-color: #ffffff;
    border-radius: 18px;
    padding: 15px 20px;
}

#chatBox p {
    margin: 5px 0;
    font-size: 18px;
}

#messageInput {
    border: none;
    background-color: none;
    color : black;
    width: 100%;
    outline: none;
}

#chatBottom {
    gap: 10px;
    overflow: hidden;
    width : 280px;
    border: solid #CACACA 1px;
    border-radius: 18px;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
}

@media (max-width: 750px) {
    #chatZone {
        bottom: 200px;
    }
}



</style>