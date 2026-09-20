<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from "gsap";
import { PhHourglass } from "@phosphor-icons/vue";
import { playerManager } from "../stores/playerManager";

const playerStore = playerManager();
const popupOpened = ref(false);

onMounted(() => {
    if (playerStore.currentMusic.name === "") {
        console.log("salut");
        popupOpened.value = true;
    }
});


const onBeforeEnter = (el) => {
    const popup = el.querySelector('#popup');

    gsap.set(el, { opacity: 0 });
    gsap.set(popup, { scale: 0.8, opacity: 0, y: 20 });
};

const onEnter = (el, done) => {
    const popup = el.querySelector('#popup');


    gsap.to(el, { opacity: 1, duration: 0.3 });
    

    gsap.to(popup, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.5)",
        onComplete: done
    });


    gsap.to("#iconWait", {
        rotation: "+=180",
        duration: 1,
        repeat: -1,
        repeatDelay: 0.3,
        ease: "back.out(1.7)"
    });
};

const onLeave = (el, done) => {
    const popup = el.querySelector('#popup');


    gsap.killTweensOf("#iconWait");


    gsap.to(popup, {
        scale: 0.8,
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in"
    });
    

    gsap.to(el, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        onComplete: done
    });
};
</script>

<template>

    <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
        :css="false"
    >

        <div id="popupBack" v-if="popupOpened" @click.self="popupOpened = false">
            <div id="popup" class="white">
                <div id="backIcon">
                    <PhHourglass id="iconWait" :size="32" color="#FFBF00" weight="fill"/>
                </div>
                <h1>WAKING UP THE SERVERS...</h1>
                <p id="desc">Hold tight. The servers are just waking up, but the house music is about to drop. Give it a few seconds and get ready for the loop!</p>
                <button class="pushable" @click="popupOpened = false">
                    <span class="front">Got it!</span>
                </button>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
#desc {
    font-size: 18px;
}

 .front {
    display: block;
    padding: 12px 62px;
    border-radius: 12px;
    font-size: 16px;
    background: #FFBF00;
    color: white;
    transform: translateY(-6px);
    transition: transform 0s,
}


.pushable:active .front {
    transition: transform 0.1s;
    transform: translateY(-2px);
}


button {
    margin-top: 20px;
    width: fit-content;
    border : none;
    border-radius: 18px;
    padding: 10px 40px 13px 40px;
    font-weight: 600;
    cursor: pointer;
    background: #d5a002;
    border-radius: 12px;
    border: none;
    padding: 0;
    outline-offset: 4px;
} 

#popupBack {
    position: fixed;
    background-color: rgba(0, 0, 0, 0.424);
    width: 100%;
    height: 100%;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
}

#popup {
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 450px;
    text-align: center;
    gap: 10px;
}

#backIcon {
    background-color: #ffbf005c;
    border-radius: 100px;
    padding: 0;
    width: 78px;
    height: 78px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>