<script setup>
    import {ref, onMounted, nextTick, inject} from 'vue';
    import {gsap} from 'gsap';
    import buttonSource from "../assets/button.mp3"
    import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
    import { chatManager } from "../stores/chatManager"

    const chatStore = chatManager()


    let nickname = ref('Anonyme');
    const buttonSound = new Audio(buttonSource);
    let messageInputFocused = false
    

    async function LoadPseudo() {
        const reponse = await fetch('/pseudos.json');
        const data = await reponse.json();
        nickname.value = data.pseudos[Math.floor(Math.random() * data.pseudos.length)];

        localStorage.setItem("nickname", nickname.value)
    }

    const ws = inject("ws")

    onMounted (async() => {

        const savedNickname = localStorage.getItem("nickname");
    
        if (savedNickname === null) {
            await LoadPseudo();
        } else {
            nickname.value = savedNickname;
        }

        ws.addEventListener('message', receiveMessage);
    })
    


    const chatBox = ref(null);
    const messages = ref([]);
    const messageText = ref('');

    function receiveMessage(event) {
        const data  = JSON.parse(event.data);

        if (data.type === 'track' || data.type === 'listeners') {
            return; 
        }
  
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

    

    function sendMessage() {
        const text = messageText.value;
        const timestamp = Date.now();
    
        if (text !== '' && text.length <= 1000 && ws) {
            buttonSound.currentTime = 0;
            buttonSound.play();
    
            const data = JSON.stringify({nickname: nickname.value, text: text, timestamp: timestamp })
            ws.send(data);
            messageText.value = '';
        }
    };

    function messageInputFocus() {
        messageInputFocused = true
    }


    

    document.addEventListener('keydown', (e) => {

        buttonSound.currentTime = 0; 
        
        if (messageInputFocused) {
            buttonSound.play();
        }

        if (e.key === "Escape") {
            if (chatStore.chatOpened) {
                buttonSound.play();
                chatStore.chatOpened = !chatStore.chatOpened
            }
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

    function closeLikesOnClickOutside() {
        if (chatStore.chatOpened) {
            buttonSound.play();
            chatStore.chatOpened = !chatStore.chatOpened
        }
    }
    

</script>

<template>

    <div v-if="chatStore.chatOpened" @click="closeLikesOnClickOutside" id="chat-backdrop"></div>

    <Transition @enter="openChatAnim" @leave="closeChatAnim" :css="false">
    
    <div id="chatZone" v-if="chatStore.chatOpened">
        <div class="fillChat" @click="closeLikesOnClickOutside"></div>
        <div id="chatZoneVert">
            <div id="chatBox" ref="chatBox" class="white">
                <div id="messages">
                    <TransitionGroup @enter="newMessageAnim" :css="false">
                    <p v-for="msg in messages" :key="msg.id">
                        <span :style="chooseColor(msg.nickname)">{{ msg.nickname }}, </span>
                        <span style="opacity: 0.5; font-size: 0.8em;">{{ msg.time }}</span>
                        <br>
                        <img v-if="msg.type === 'gif'" :src="msg.gifUrl" alt="" id="gif">
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
        

        <div class="fillChat" @click="closeLikesOnClickOutside"></div>
    </div>

    </Transition>

</template>

<style>

#gif {
    height: auto;
    width: 150px;
}

#chat-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 24;
    background: transparent;
}

.fillChat {
    background-color: transparent;
    width: 50%;
    height: 400px;
}

#chatZone {
    width: 100%;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    gap : 10px;

    position: fixed;
    bottom: 150px;

    z-index: 25;
}

#chatZoneVert {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap : 10px;
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

.messageLine {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
}
@media (max-width: 1120px) {
    #chatZone {
        bottom: 100px;
    }

    #chat-backdrop {
        background: rgba(0, 0, 0, 0.748);
    }
}



</style>