<script setup>
import { onMounted, ref } from 'vue';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import ActionButtons from './ActionButtons.vue';
import welcomeSource from "../assets/welcome.mp3"
import { gsap } from "gsap"


const audioRef = ref(null);
const canvasRef = ref(null);
let visualizerInit = false;
let visualizer = null;

const welcome = new Audio(welcomeSource)


function initVisualizer() {
    const canvas = canvasRef.value;
    const audio = audioRef.value;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioContext.destination);

    const createVis = butterchurn.default ? butterchurn.default.createVisualizer : butterchurn.createVisualizer;
    
    visualizer = createVis(audioContext, canvas, {
        width: canvas.width,
        height: canvas.height,
        pixelRatio: 1
    });

    const presetsObj = butterchurnPresets.default ? butterchurnPresets.default.getPresets() : butterchurnPresets.getPresets();
    const presetNames = Object.keys(presetsObj);

    const loadRandomPreset = (transitionTime = 0) => {
        const randomName = presetNames[Math.floor(Math.random() * presetNames.length)];
        visualizer.loadPreset(presetsObj[randomName], transitionTime);
    };

    loadRandomPreset(0);
    setInterval(() => loadRandomPreset(2.7), 15000);

    function render() {
        requestAnimationFrame(render);
        visualizer.render();
    }
    
    render();
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

let firstLaunch = true

function playMusic() {
    console.log("Lancé la team");

    if (firstLaunch) {
        playVoice(welcome)
        firstLaunch = false
    }
    
    const audio = audioRef.value;
    const timestamp = new Date().getTime();
    audio.src = `/stream?t=${timestamp}`;
    
    audio.play().catch(err => console.log("Erreur lecture audio:", err));

    if (!visualizerInit) {
        initVisualizer();
        visualizerInit = true;
    }
}

function pauseMusic() {
    console.log("STOPPP");
    const audio = audioRef.value;
    audio.pause();
}


</script>

<template>
    <canvas ref="canvasRef" id="visualizer-canvas" width="800" height="600" style="background: black;"></canvas>
  
    <ActionButtons @play-music="playMusic" @pause-music="pauseMusic"/>


    <audio ref="audioRef" id="radio-audio" controls crossorigin="anonymous"></audio>
</template>

<style>

audio {
    display: none;
}

canvas {
    height: 100%;
    width: 100%;
    position : absolute;
    z-index: -1;
    top: 0px;
}




</style>