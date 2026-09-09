<script setup>

import { onMounted, ref, computed } from 'vue'
import playIcon from "../assets/play.png"
import pauseIcon from "../assets/pause.png"
import buttonSource from "../assets/button.mp3"
import { PhPlay, PhPause, PhChatsCircle, PhHeart } from "@phosphor-icons/vue";
import easterEgg4Source from "../assets/easteregg4.mp3"
import { gsap } from "gsap"



const buttonSound = new Audio(buttonSource)
const easterEgg4 = new Audio(easterEgg4Source)


const currentIcon = ref(playIcon)
const emits = defineEmits(["playMusic","pauseMusic"])

function playClicked() {

    console.log("Salut t'as cliqué")
    buttonSound.play()
    
    if (currentIcon.value == pauseIcon) {
        console.log("On veut mettre pause !!")
        currentIcon.value = playIcon
        
        emits("pauseMusic")
    } else {
        currentIcon.value = pauseIcon
        emits("playMusic")
    }
}

const isPlay = computed(() => currentIcon.value === playIcon)

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

function like() {

    clickCount++

    if (clickCount == 10) {
        clickCount = 0
        playVoice(easterEgg4)
    }

    buttonSound.play()
    liked.value = !liked.value
}

setInterval(() => {

    if (clickCount > 0) {
        clickCount--
    }

    console.log("Clickcount :" + clickCount)
    
}, 3000)


const liked = ref(false)

</script>


<template>

<div id="actionButtons">

    <div @click="like" id="like" class="action white">
        <PhHeart v-if="liked" :size="22" weight="fill" />
        <PhHeart v-if="!liked" :size="22" />
    </div>

    <div @click="playClicked" id="pause" class="action white">
        <PhPlay v-if="isPlay" :size="32" weight="fill" />
        <PhPause v-if="!isPlay" :size="32" weight="fill" />
    </div>

    <div id="chat" class="action white">
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



</style>