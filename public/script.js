async function fetchCurrentTrack() {
    try {
        const response = await fetch('/current-track');
        const data = await response.json();
        

        document.getElementById('name').textContent = data.name;
        document.getElementById('author').textContent = data.author;
        document.getElementById('cover').src = data.cover;
        console.log(data)
    } catch (e) {
        console.error("Impossible de récupérer les infos", e);
    }
}




setInterval(fetchCurrentTrack, 5000);
fetchCurrentTrack();


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

/*likeBtn.addEventListener('click', () => {
    const songName = document.getElementById('name').textContent;
    const artist = document.getElementById('author').textContent;
    const cover = document.getElementById('cover').src;

    let likes = getLikes();
    if (isLiked(songName)) {
        likes = likes.filter(function(song) {
            return song.name !== songName;
        });
        likeBtn.textContent = '🤍 Like';
    } else {
        likes.push({ name: songName, artist: artist, cover: cover });
        likeBtn.textContent = '❤️ Like';
    }

    saveLikes(likes);
    console.log('Likes actuels :', likes);
});*/

const socket = new WebSocket('ws://localhost:7500');
const chatDiv = document.getElementById('chat');

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

