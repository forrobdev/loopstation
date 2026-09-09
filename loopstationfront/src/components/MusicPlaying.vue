<script setup>

import { inject, ref, onMounted} from "vue";
import { gsap } from "gsap";


const ws = inject("ws")

const musicInfos = ref({})

ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    
    // Si c'est une nouvelle musique
    if (message.type === 'track') {
        console.log("Nouvelle musique :", message.data);
        animNextMusic(message.data);
    } 
});


let isAnimating = false;

function animNextMusic(data) {
    isAnimating = true;


    gsap.fromTo("#nowPlaying", 
        { x: 200 }, 
        { x: 0, duration: 0.3, delay: 1, ease: "power4.out", overwrite: true }
    );

    const poster = document.querySelector("#musicPlaying");
    

    poster.style.transition = "none";
    
    let tl = gsap.timeline({
        overwrite: true,
        onComplete: () => {
            // 1. On nettoie GSAP quand on est sagement revenu à 0°
            gsap.set(poster, { clearProps: "transform" });
            
            // 2. On attend la prochaine frame du navigateur pour réactiver le CSS
            // Ça évite le bug du "360 ultra rapide" !
            requestAnimationFrame(() => {
                poster.style.transition = "transform 0.1s ease";
                isAnimating = false; // On rend le contrôle à la souris
            });
        }
    });

    tl.set(poster, { rotationX: 0, rotationY: 0 })
      .to(poster, {
        rotationY: 90,
        duration: 0.2, // Rapide et sec pour cacher l'image
        ease: "power2.in",
        onComplete: () => {
            // On met à jour les données quand la carte est de profil
            musicInfos.value = data;
        }
    })
      // On triche : on la place de l'autre côté instantanément
      .set(poster, { rotationY: -90 }) 
      .to(poster, {
        rotationY: 0, // Elle revient à plat naturellement
        duration: 0.3,
        ease: "power2.out"
    });
}

onMounted(() => {
    const poster = document.querySelector("#musicPlaying")
    const posterParent = document.querySelector("#musicPlayingParent")

    posterParent.style.perspective = "1000px";

    poster.addEventListener('mousemove', (e) => {

        if (isAnimating) return;

        const rect = poster.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        poster.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    poster.addEventListener('mouseleave', () => {
        if (isAnimating) return;
        poster.style.transform = 'rotateX(0) rotateY(0)';
    });
})



</script>


<template>

<div id="musicPlayingParent">
    <div id="musicPlaying" class="white">
        <div id="nowPlaying">
            <p>Now playing</p>
        </div>
        <img id="cover" :src="musicInfos.cover" alt="Pochette de l'album">
        <p id="name">{{ musicInfos.name }}</p>
        <p id="author">{{ musicInfos.author }}</p>
    </div>
</div>




</template>

<style>

#musicPlaying {
    border-radius: 18px;
    padding: 20px 15px;
    width: 230px;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow : hidden;
    text-align: center;

    transition: transform 0.2s ease;
    transform-style: preserve-3d;

    position: absolute;
    top : 50px;
    left: 50px;

}



#nowPlaying {
    position: absolute;
    top : 5%;
    right: 0px;
    padding: 5px 10px;
    border-radius: 100px 0px 00px 100px;
    background-color: #FFBF00;
    color : #fff;
    filter: drop-shadow(0px 0px 20px rgba(0, 0, 0, 0.416))
}

#cover {
    border-radius: 8px;
}

#name {
    margin-top: 10px;
    color : #FFBF00;
    font-size: 25px;
}

#author {
    margin-top : -10px;
}

</style>