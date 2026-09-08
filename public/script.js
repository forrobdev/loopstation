const buttonSound = new Audio("/assets/button.mp3")

const ws = new WebSocket(`ws://${window.location.host}`);

function animNextMusic(name, author, cover) {

    document.querySelector("#musicPlaying").style.transition = "none"
    
    let tl = gsap.timeline({
        overwrite: true
    });

    tl.to("#musicPlaying", {
        rotationY: "+=90",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            document.querySelector("#cover").src = cover;
            document.querySelector("#author").innerHTML = author;
            document.querySelector("#name").innerHTML = name;
            
        }
    })

    .to("#musicPlaying", {
        rotationY: "+=270",
        duration: 1.7,
        ease: "power4.out",
        onComplete: () => {
            console.log('finish');
        }
    });

    document.querySelector("#musicPlaying").style.transition = " transform 0.1s ease;"
}

// 2. Quand la connexion est réussie
ws.onopen = () => {
    console.log("🟢 Connecté à la radio en temps réel !");
};

// 3. Quand on reçoit un message du serveur (quand la musique change)
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    // Si c'est une nouvelle musique
    if (message.type === 'track') {
        console.log("Nouvelle musique :", message.data);
        animNextMusic(message.data.name, message.data.author, message.data.cover);
    } 
    // Si c'est une mise à jour du nombre d'auditeurs
    else if (message.type === 'listeners') {
        console.log("Auditeurs en direct :", message.count);
        
        document.querySelector(".online p").innerHTML = message.count;
    }
};

// 4. En cas d'erreur ou de coupure
ws.onclose = () => {
    console.log("🔴 Connexion perdue avec le serveur.");
};

const poster = document.querySelector("#musicPlaying")
const posterParent = document.querySelector("#musicPlayingParent")

posterParent.style.perspective = "1000px";

// Dès que la souris bouge sur l'affiche, on calcule la rotation
poster.addEventListener('mousemove', (e) => {
    // On récupère les dimensions et la position exacte de la carte sur l'écran
    const rect = poster.getBoundingClientRect();
    
    // On calcule la position de la souris par rapport au bord de la carte
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // On détermine où se trouve le centre de la carte
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // On calcule l'angle de rotation (ici, l'intensité est réglée avec le multiplicateur 10)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // On applique la transformation CSS en direct
    poster.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// Quand la souris quitte la carte, on la remet gentiment à plat (0 degré)
poster.addEventListener('mouseleave', () => {
    poster.style.transform = 'rotateX(0) rotateY(0)';
});

gsap.from("#nowPlaying", 
    { 
        ease : "power4.out",
        x: 200, 
        duration: 0.3,
        delay: 1,
    });

const likeBtn = document.getElementById('likeBtn')

// Récupère la liste des likes déjà sauvegardés (ou tableau vide si rien)
function getLikes() {
    const datalike = localStorage.getItem('likedSongs');
    if (datalike) {
        return JSON.parse(datalike);
    } else {
        return [];
    }
}

// Sauvegarde la liste des likes
function saveLikes(likes) {
    localStorage.setItem('likedSongs', JSON.stringify(likes));
}

function isLiked(songName) {
    const likes = getLikes();

    for (let i = 0; i < likes.length; i++) {
        if (likes[i].name === songName) {
            return true;
        }
    }

    return false;
}



const audio = document.getElementById('radio-audio');
const canvas = document.getElementById('visualizer-canvas');
const pause = document.querySelector("#pause");
const like = document.querySelector("#like");

// like.addEventListener("click", () => {
//     buttonSound.play()
//     const stateImg = like.querySelector("img").getAttribute("src")
    
//     if (stateImg == "assets/like.png") {
//         like.querySelector("img").setAttribute("src","assets/liked.png")
//     } else {
//         like.querySelector("img").setAttribute("src","assets/like.png")
//     }

// likeBtn.addEventListener('click', () => {
//     const songName = document.getElementById('name').textContent;
//     const artist = document.getElementById('author').textContent;
//     const cover = document.getElementById('cover').src;

//     let likes = getLikes();
//     if (isLiked(songName)) {
//         likes = likes.filter(function(song) {
//             return song.name !== songName;
//         });
//     } else {
//         likes.push({ name: songName, artist: artist, cover: cover });
//     }

//     saveLikes(likes);
//     console.log('Likes actuels :', likes);
// })

let visualizerInit = false;


function playMusic() {
    
    console.log("Lancé la team");
    
    // On force la connexion au flux direct
    const timestamp = new Date().getTime();
    audio.src = `/stream?t=${timestamp}`;
    
    // Lance le son
    audio.play();

    // Initialise le visuel une seule fois
    if (!visualizerInit) {
        initVisualizer();
        visualizerInit = true;
    }
}


pause.addEventListener("click", () => {
    console.log("Salut t'as cliqué")
    buttonSound.play()
    const stateImg = pause.querySelector("img").getAttribute("src")
    
    if (stateImg == "assets/pause.png") {
        pause.querySelector("img").setAttribute("src","assets/play.png")
        audio.pause();
    } else {
        pause.querySelector("img").setAttribute("src","assets/pause.png")
        
        playMusic(); 
    }
})

// --- INITIALISATION BUTTERCHURN ---
function initVisualizer() {
    // 1. Créer le moteur audio du navigateur
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // 2. Lier notre balise <audio> au moteur
    const sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioContext.destination); // Pour qu'on puisse entendre le son sortant

    // 3. Initialiser Butterchurn
    // Selon comment le CDN charge le script, on récupère la bonne fonction
    const createVis = butterchurn.default ? butterchurn.default.createVisualizer : butterchurn.createVisualizer;
    
    const visualizer = createVis(audioContext, canvas, {
        width: canvas.width,
        height: canvas.height,
        pixelRatio: window.devicePixelRatio || 1
    });

    // 4. Récupérer les "presets" (les différents effets visuels de Milkdrop)
    const presetsObj = butterchurnPresets.default ? butterchurnPresets.default.getPresets() : butterchurnPresets.getPresets();
    const presetNames = Object.keys(presetsObj);

    // Fonction pour charger un effet au hasard
    const loadRandomPreset = (transitionTime = 0) => {
        const randomName = presetNames[Math.floor(Math.random() * presetNames.length)];
        visualizer.loadPreset(presetsObj[randomName], transitionTime);
    };

    // Charger le premier effet immédiatement (0s de transition)
    loadRandomPreset(0);

    // Bonus : Changer d'effet visuel toutes les 15 secondes avec un beau fondu (2.7s)
    setInterval(() => loadRandomPreset(2.7), 15000);

    // 5. La boucle d'animation fluide à 60 FPS
    function render() {
        requestAnimationFrame(render);
        visualizer.render();
    }
    
    // Lancer la boucle
    render();
}






//Animer le bouton radio "bounce"
const bounce = gsap.timeline({ defaults: { duration: 0.8 }, repeat: -1, repeatDelay: 0.8 });
    bounce.to(".greenBack", {
        ease: "power4.out",
        scale: 2,
    })
    .to(".greenBack", {
        ease: "power4.in",
        scale: 1,
    })

const socket = new WebSocket('ws://localhost:7500');
const chatDiv = document.querySelector("#messages");

socket.addEventListener('open', () => {
    console.log('Connecté au serveur WebSocket');
});

socket.addEventListener('message', (event) => {
    const morceaux = event.data.split(':');
    const pseudoRecuperer = morceaux[0];
    const messageRecuperer = morceaux[1];
    
    const p = document.createElement('p');
    p.innerHTML = '<span style="color: #FFBF00;">' + pseudoRecuperer + ':</span> ' + messageRecuperer;
    chatDiv.appendChild(p);
});


const pseudoInput = document.getElementById('pseudoInput');
const validerPseudo = document.getElementById('validerPseudo')

let pseudo = 'Anonyme';

validerPseudo.addEventListener('click', () => {
    if (pseudoInput.value.trim() !== ''){
        pseudo = pseudoInput.value 
        console.log('Pseudo choisi:', pseudo);
    }
});

const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');

sendBtn.addEventListener('click', () => {
    const texte = messageInput.value;

    if (texte !== '') {
        socket.send(pseudo + ' : '+ texte);
        messageInput.value = '';
    }
});

