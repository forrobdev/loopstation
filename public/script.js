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

likeBtn.addEventListener('click', () => {
    const songName = document.getElementById('name').textContent;
    const artist = document.getElementById('author').textContent;
    const cover = document.getElementById('cover').src;

    let likes = getLikes();
    likes.push({ name: songName, artist: artist, cover: cover });
    saveLikes(likes);

    console.log('Liké !', likes);
});