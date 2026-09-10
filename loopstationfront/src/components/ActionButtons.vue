<script setup>

import { onMounted, ref, computed, inject } from 'vue'
import buttonSource from "../assets/button.mp3"
import { PhPlay, PhPause, PhChatsCircle, PhHeart } from "@phosphor-icons/vue";
import easterEgg4Source from "../assets/easteregg4.mp3"
import { gsap } from "gsap"
import { likeManager } from "../stores/counter"



const buttonSound = new Audio(buttonSource)
const easterEgg4 = new Audio(easterEgg4Source)
const isPlay = ref(true)

const likesStore = likeManager()

// const currentIcon = ref(playIcon)
const emits = defineEmits(["playMusic","pauseMusic", "refreshLikedMusic"])

function playClicked() {

    console.log("Salut t'as cliqué")
    buttonSound.play()
    
    if (!isPlay.value) {
        console.log("On veut mettre pause !!")
        isPlay.value = true
        
        emits("pauseMusic")
    } else {
        isPlay.value = false
        emits("playMusic")
    }

    console.log("isPLay :" + isPlay.value)
}



function playVoice(voiceAudio) {

    const bgMusic = document.getElementById("radio-audio");

    if (bgMusic) {
        gsap.to(bgMusic, { volume: 0.05, duration: 0.5 });
    }

    voiceAudio.play();

    voiceAudio.onended = () => {
        if (bgMusic) {
            gsap.to(bgMusic, { volume: 1, duration: 0.5 });
        }
    };
}



let clickCount = 0

function isLiked(musicName, musicAuthor) {
    const allLikes = JSON.parse(localStorage.getItem("likes")) ?? []


    liked.value = allLikes.some(music => 
        music.name === musicName && 
        music.author === musicAuthor
    )
}

const ws = inject("ws")

ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    
    // Si c'est une nouvelle musique
    if (message.type === 'track') {
        isLiked(message.data.name,message.data.author)
        console.log("Nouvelle musique la team !")
    } 
});

function likeClick() {

    clickCount++

    if (clickCount === 10) {
        clickCount = 0
        playVoice(easterEgg4)
    }

    console.log("Clickcount :" + clickCount)

    buttonSound.play()
    liked.value = !liked.value


    const musicName = document.querySelector("#name").innerHTML
    const musicAuthor = document.querySelector("#author").innerHTML
    const musicCover = document.querySelector("#cover").src

    if (liked.value) {
       likesStore.like(musicName,musicAuthor,musicCover)
    } else {
        likesStore.dislike(musicName,musicAuthor,musicCover)
    }

}

setInterval(() => {

    if (clickCount > 0) {
        clickCount--
    }
    
}, 3000)


const liked = ref(false)
let chatOpened = false

function toggleChat() {

    buttonSound.play()


    if (chatOpened) {
        gsap.to("#chatZone", {
            duration : 0.3,
            ease : "power4.out",
            opacity : 0,
            y : 200,
        })

        chatOpened = false
    } else {
        gsap.to("#chatZone", {
            duration : 0.3,
            ease : "power4.out",
            opacity : 1,
            y : 0,
        })

        chatOpened = true
    }

}

</script>


<template>

<div id="actionButtons">

    <div @click="likeClick" id="like" class="action white">
        <PhHeart v-if="liked" :size="22" weight="fill" />
        <PhHeart v-if="!liked" :size="22" />
    </div>

    <div @click="playClicked" id="pause" class="action white">
        <PhPlay v-if="isPlay" :size="32" weight="fill" />
        <PhPause v-if="!isPlay" :size="32" weight="fill" />
    </div>

    <div @click="toggleChat" id="chat" class="action white">
        <PhChatsCircle :size="22" weight="fill" />
    </div>

    

</div>

</template>

<style>

#pause {
    width: 80px;
    height: 80px;
}

#pause img {
    width: auto;
    height: 30px;
}

.action {
    background-color: #fff;
    border-radius: 100px;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow : hidden;
    width: 60px;
    height: 60px;

    

    cursor : pointer;
    transition : 0.3s ease-in-out;
}

.action:hover {
    scale: 1.05;
}

.action img {
    height : auto;
    width : 20px;
}

#actionButtons {
    display : flex;
    justify-content: center;
    align-items: center;
    gap: 30px;

    position: absolute;
    bottom : 40px;

    z-index: 2;
    width: 100%;
    height: fit-content;
}



</style>