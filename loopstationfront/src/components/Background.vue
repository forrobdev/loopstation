<script setup>
import { onMounted, ref } from 'vue';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import ActionButtons from './ActionButtons.vue';
import welcomeSource from "../assets/welcome.mp3"
import { gsap } from "gsap"
import logoSource from "../assets/logo.png"



const logoRef = ref(null);

const audioRef = ref(null);
const canvasRef = ref(null);
let visualizerInit = ref(false);
let visualizer = null;

const welcome = new Audio(welcomeSource)
let firstLaunch = true


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
        pixelRatio: window.devicePixelRatio || 1
    });

    visualizer.connectAudio(sourceNode);

    const presetsObj = butterchurnPresets.default ? butterchurnPresets.default.getPresets() : butterchurnPresets.getPresets();
    const presetNames = Object.keys(presetsObj);

    const favoritePresets = [
        "_Mig_085",
        "$$$ Royal - Mashup (220)",
        "An AdamFX n Martin Infusion 2 flexi - Why The Sky Looks Diffrent Today - AdamFx n Martin Infusion - Tack Tile Disfunction B",
        "cope + martin - mother-of-pearl",
        "flexi + amandio c - organic12-3d-2.milk",
        "Flexi + stahlregen - jelly showoff parade",
        "Geiss - Cauldron - painterly 2 (saturation remix)",
        "martin - castle in the air",
        "Martin - charisma",
        "Martin - liquid arrows",
        "martin [shadow harlequins shape code] - fata morgana",
        "ORB - Waaa",
        "Rovastar - Oozing Resistance",
        "Unchained - Rewop",
        "Unchained - Unified Drag 2",
        "yin - 191 - Temporal singularities"
    ];

    const loadRandomPreset = (transitionTime = 0) => {
        const randomName = favoritePresets[Math.floor(Math.random() * favoritePresets.length)];
        visualizer.loadPreset(presetsObj[randomName], transitionTime);
    };

    loadRandomPreset(0);
    setInterval(() => loadRandomPreset(2.7), 30000);

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




function playMusic() {

    if (firstLaunch) {
        playVoice(welcome)
        firstLaunch = false
    }
    
    const audio = audioRef.value;
    const timestamp = new Date().getTime();
    audio.src = `/stream?t=${timestamp}`;
    
    audio.play().catch(err => console.log("Erreur lecture audio:", err));

    if (!visualizerInit.value) {
        initVisualizer();
        visualizerInit.value = true;
    }
}

function pauseMusic() {
    const audio = audioRef.value;
    audio.pause();
}

function moveLogo(event) {
    if (!logoRef.value) return;


    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const distanceX = mouseX - centerX;
    const distanceY = mouseY - centerY;

    
    const movementLimit = 20; 
    
    const moveX = distanceX / movementLimit;
    const moveY = distanceY / movementLimit;

    gsap.to(logoRef.value, {
        x: moveX,
        y: moveY,
        duration: 0.5,
        ease: "power2.out"
    });
}


function resetLogo() {
    if (!logoRef.value) return;
    
    gsap.to(logoRef.value, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)"
    });
}


</script>

<template>


    <div @mousemove="moveLogo" @mouseleave="resetLogo" v-if="!visualizerInit" id="logoParent" >
        <img  :src="logoSource" alt="Loop Station Logo" id="logo" ref="logoRef">
    </div>
    

    <canvas ref="canvasRef" id="visualizer-canvas" width="800" height="600" style="background: black;"></canvas>
  

    <ActionButtons @play-music="playMusic" @pause-music="pauseMusic"/>


    <audio ref="audioRef" id="radio-audio" controls crossorigin="anonymous"></audio>
</template>

<style>

#logoParent {
    z-index: 0;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

#logo {
    height: 200px;
    width: auto;
    opacity: 0.2;
}

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