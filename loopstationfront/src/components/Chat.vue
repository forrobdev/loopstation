<script setup>
    import {ref, onMounted, nextTick} from 'vue';
    import {gsap} from 'gsap';
    import buttonSource from "../assets/button.mp3"
    import { PhPaperPlaneTilt } from "@phosphor-icons/vue";



    let nickname = 'Anonyme';
    const buttonSound = new Audio(buttonSource);
    

    async function chargerPseudo() {
        const reponse = await fetch('pseudos.json');
        const data = await reponse.json();
        nickname = data.pseudos[Math.floor(Math.random() * data.pseudos.length)];

        console.log("Nickname :" + nickname)

        localStorage.setItem("nickname", nickname)
    }

    onMounted (async() => {
        if (localStorage.getItem("nickname") === null) {
            await chargerPseudo()
        } else {
            nickname = localStorage.getItem("nickname")
            console.log("Nickname :" + nickname)
        }

        socket = new WebSocket(import.meta.env.VITE_API_KEY);

        socket.addEventListener('open', () => {
            console.log('Connecté au serveur WebSocket');
        });

        socket.addEventListener('message', receiveMessage);
    })
    

    let ChatOpen = ref(true); 

    function ToggleChat() {
        buttonSound.play()

        if (ChatOpen.value) {
            gsap.to("#chatZone", { duration: 0.3, ease: "power4.out", opacity: 0, y: 200 });
            ChatOpen.value = false;
        } else {
            gsap.to("#chatZone", { duration : 0.3, ease : "power4.out", opacity : 1, y : 0});
            ChatOpen.value = true;
        }
    }

    let socket = null;
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
            time: displayedTime
        });

        nextTick (() => {
            if (chatBox.value) {
                chatBox.value.scrollTop = chatBox.value.scrollHeight;
            }
        });

        setTimeout(() => {
            messages.value = messages.value.filter(m => m.id !== id);
        }, 60000);
    }

    let messageInputFocused = false

    function sendMessage() {
        const text = messageText.value;
    
        if (text !== '' && text.length <= 1000 && socket) {
            buttonSound.currentTime = 0;
            buttonSound.play();
    
            const timestamp = Date.now();
            const data = JSON.stringify({nickname : nickname, text: text, timestamp: timestamp })
            socket.send(data);
            messageText.value = '';
        }
    }

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

    onMounted(() => {
        gsap.to("#chatZone", {
            duration : 0.3,
            ease : "power4.out",
            opacity : 0,
            y : 200,
        })
    })


</script>

<template>
    
    <div id="chatZone">
        <div id="chatBox" ref="chatBox" class="white">
            <div id="messages">
                <p v-for="msg in messages" :key="msg.id">
                    <span style="color: #FFBF00;">{{ msg.nickname }}, </span>
                    <span style="opacity: 0.5; font-size: 0.8em;">{{ msg.time }}</span>
                    <br>
                    {{ msg.text }}
                    
                </p>
            </div>
        </div>

        <div id="chatBottom" class="white">
            <input type="text" id="messageInput" placeholder="Votre message" v-model="messageText" @keyup.enter="sendMessage" @focus="messageInputFocused = true" @blur="messageInputFocused = false">
            <PhPaperPlaneTilt @click="sendMessage" :size="28" weight="fill" style="cursor: pointer;" />
        </div>
        
    </div>

    <div id="Chat" @click="ToggleChat"></div>
    

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



</style>