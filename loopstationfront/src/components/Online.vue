<script setup>
import { inject, ref, onMounted } from "vue";
import { gsap } from "gsap";
import buttonSource from "../assets/button.mp3"
import easterEgg1Source from "../assets/easteregg1.mp3"
import easterEgg2Source from "../assets/easteregg2.mp3"
import easterEgg3Source from "../assets/easteregg3.mp3"



const buttonSound = new Audio(buttonSource)
const easterEgg1 = new Audio(easterEgg1Source)
const easterEgg2 = new Audio(easterEgg2Source)
const easterEgg3 = new Audio(easterEgg3Source)

const ws = inject("ws")
const onlineNumber = ref(0)

const onlineCard = ref(null)

ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    console.log("On a reçu un message !" + message)

    if (message.type === 'listeners') {
        console.log("Auditeurs en direct :", message.count);
        onlineNumber.value = message.count;
    }
});

onMounted(() => {
    const bounce = gsap.timeline({ defaults: { duration: 0.8 }, repeat: -1, repeatDelay: 0.8 });
    bounce.to(".greenBack", {
        ease: "power4.out",
        scale: 2,
    })
    .to(".greenBack", {
        ease: "power4.in",
        scale: 1,
    })
})

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


function animateCard() {

    clickCount++

    console.log("ClickCount :" + clickCount)

    if (clickCount === 10) {
        playVoice(easterEgg1)
    } else if (clickCount === 20) {
        playVoice(easterEgg2)
    } else if (clickCount === 100) {
        playVoice(easterEgg3)
    }

    buttonSound.play()
    const angle = Math.random() > 0.5 ? 15 : -15;


    gsap.killTweensOf(onlineCard.value);


    gsap.timeline()
        .to(onlineCard.value, { 
            scale: 1.15,     
            rotation: angle,
            duration: 0.15, 
            ease: "power2.out" 
        })
        .to(onlineCard.value, { 
            scale: 1,      
            rotation: 0,
            duration: 0.4, 
            ease: "bounce.out" 
        });
}

</script>

<template>

<div ref="onlineCard" class="online white" @click="animateCard">
    <div class="green">
        <div class="greenBack"></div>
    </div>
    <p>{{ onlineNumber }}</p>
</div>
</template>

<style>

.online {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10000px;
    height: 50px;
    width: fit-content;
    padding: 0 20px;
    gap: 20px;
    z-index: 10;
    position: fixed;
    top: 40px;
    right: 50px;
    

    cursor: pointer; 
}

.online p {
    font-weight: 600;
    font-size: 22px;
}

.green {
    background-color: #60E335;
    height: 15px;
    width: 15px;
    border-radius: 100px;
    z-index: 2;
}

.greenBack {
    background-color: rgba(96, 227, 53, 0.54);
    height: 15px;
    width: 15px;
    border-radius: 100px;
    position: absolute;
    z-index: 1;
}
</style>