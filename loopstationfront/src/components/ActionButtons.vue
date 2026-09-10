<script setup>

import { onMounted, ref, computed, inject } from 'vue'
import buttonSource from "../assets/button.mp3"
import { PhPlay, PhPause, PhChatsCircle, PhHeart } from "@phosphor-icons/vue";
import easterEgg4Source from "../assets/easteregg4.mp3"
import { gsap } from "gsap"
import { likeManager } from "../stores/counter"
import { chatManager } from "../stores/chatManager"
import { playerManager } from "../stores/playerManager"




const buttonSound = new Audio(buttonSource)
const easterEgg4 = new Audio(easterEgg4Source)
const isPlay = ref(true)

const likesStore = likeManager()

const chatStore = chatManager()

const playerStore = playerManager()

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

function likeClick() {

    clickCount++

    if (clickCount === 10) {
        clickCount = 0
        playVoice(easterEgg4)
    }

    console.log("Clickcount :" + clickCount)



    const musicName = playerStore.currentMusic.name
    const musicAuthor = playerStore.currentMusic.author
    const musicCover = playerStore.currentMusic.cover

    if (!likesStore.isCurrentMusicLiked) {
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



function toggleChat() {
    buttonSound.play()

    chatStore.chatOpened = !chatStore.chatOpened
}

</script>


<template>

<div id="actionButtons">

    <div @click="likeClick" id="like" class="action white">
        <PhHeart v-if="likesStore.isCurrentMusicLiked" :size="22" weight="fill" />
        <PhHeart v-else="likesStore.isCurrentMusicLiked" :size="22" />
    </div>

    <div @click="playClicked" id="pause" class="action white">
        <PhPlay v-if="isPlay" :size="32" weight="fill" />
        <PhPause v-else="isPlay" :size="32" weight="fill" />
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

@media (max-width: 750px) {
    #actionButtons {
        bottom: 100px;
    }
}




</style>