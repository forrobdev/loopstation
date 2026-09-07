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