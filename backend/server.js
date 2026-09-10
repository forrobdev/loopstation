import express from "express"
import path from "node:path"
import fs from 'node:fs'
import { spawn, execSync } from "node:child_process"
import cors from "cors"
import {styleText} from 'node:util'
import { WebSocketServer, WebSocket } from 'ws';

//Temporairez
import readline from 'node:readline';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const app = express()
const PORT = 3000

let playlist = []
let currentTrackIndex = getRandomInt(16)
let ffmpegProcess = null
const clients = new Set()
let tracksInfos = []
let wss = null; // On prépare la variable pour les WebSockets

//Envoyer les auditeèurs en live

function broadcastListenerCount() {
    if (!wss) return;
    

    const message = JSON.stringify({ 
        type: 'listeners', 
        count: clients.size 
    });
    
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { 
            client.send(message);
        }
    });
}

// 1. Load audio files into memory
const loadPlaylist = async () => {
    // Récupérer les infos des sons au démarrage
    try {
        const jsonPath = path.join(import.meta.dirname, 'tracks', 'tracks-infos.json')
        const rawData = await fs.promises.readFile(jsonPath, 'utf-8')
        tracksInfos = JSON.parse(rawData)
    } catch (error) {
        console.log(styleText(['bold', 'yellow'], 'Impossible de charger tracks-infos.json', error.message))
    }
    //---

    const tracks = await fs.promises.glob("tracks/**.mp3")

    for await (const track of tracks) {
        playlist.push(track)
    }

    if (playlist.length === 0) {
        console.log(styleText(['bold', 'red'], 'No audio files found in ./tracks'))
        process.exit(1)
    }
    console.log(styleText(['bold', 'green'], `Loaded ${playlist.length} tracks.`))
}

let jingles = [];

const loadJingles = async () => {
    try {
        
        const jingleFiles = await fs.promises.glob("public/jingles/**.mp3");
        for await (const jingle of jingleFiles) {
            jingles.push(jingle);
        }
        console.log(styleText(['bold', 'green'], `Loaded ${jingles.length} jingles.`));
    } catch (error) {
        console.log(styleText(['bold', 'yellow'], 'Aucun jingle trouvé.', error.message));
    }
}

function getMediaDuration(filePath) {
    try {
        const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
        return parseFloat(output.toString().trim());
    } catch (err) {
        console.log(styleText(['bold', 'yellow'], 'Erreur ffprobe, durée par défaut 5s utilisée'));
        return 5;
    }
}

// 2. Stream the current track, then automatically trigger the next
const playTrack = (index) => {
    const trackPath = playlist[index];
    console.log(`▶ Okok, now playing: ${path.basename(trackPath)}`);

    // --- WEBSOCKET : On prévient tout le monde que la musique change ---
    if (wss) {
        const trackInfo = getTrackInfoFromJSON(trackPath);
        const message = JSON.stringify({ type: 'track', data: trackInfo });
        
        wss.clients.forEach((client) => {
            if (client.readyState === 1) client.send(message);
        });
    }
    // ------------------------------------------------------------------

    let ffmpegArgs = [];

    // Si on a des jingles chargés en mémoire
    if (jingles.length > 0) {
        const randomJingle = jingles[Math.floor(Math.random() * jingles.length)];
        const jingleDuration = getMediaDuration(randomJingle);
        
        console.log(`📢 Mixage en cours avec le jingle : ${path.basename(randomJingle)}`);

        ffmpegArgs = [
            '-re',
            '-i', trackPath,       // Input 0 : La musique
            '-i', randomJingle,    // Input 1 : Le jingle
            '-filter_complex', 
            `[0:a]volume='if(lt(t,${jingleDuration}), 0.4, min(1, 0.4 + (t-${jingleDuration})/2))':eval=frame[music_ducked];[1:a]volume=5.0[jingle_boosted];[music_ducked][jingle_boosted]amix=inputs=2:duration=first[out]`,
            '-map', '[out]',
            '-f', 'mp3',
            '-c:a', 'libmp3lame',
            '-b:a', '128k',
            '-ar', '44100',
            '-ac', '2',
            'pipe:1'
        ];
    } else {
        // Fallback classique si aucun jingle n'est trouvé
        ffmpegArgs = [
            '-re', '-i', trackPath, '-vn', '-f', 'mp3',
            '-c:a', 'libmp3lame', '-b:a', '128k', '-ar', '44100', '-ac', '2', 'pipe:1'
        ];
    }

    // Lancement du process
    ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    ffmpegProcess.stdout.on('data', (chunk) => {
        for (const client of clients) client.write(chunk);
    });

    ffmpegProcess.on('close', (code) => {
        ffmpegProcess = null;
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        console.log(`Aaaaaaaaand, are you ready for the next track?`);
        playTrack(currentTrackIndex);
    });
};


// Récupérer les infos des tracks
function getTrackInfoFromJSON(trackPath) {
    const fileName = path.basename(trackPath)
    const noExtension = fileName.replace('.mp3', '')
    const trackIdText = noExtension.replace('music', '')
    const trackId = parseInt(trackIdText, 10) 

    const track = tracksInfos.find((t) => {
        return t.track_id === trackId
    })

    return track || { 
        name: "Titre inconnu", 
        author: "Artiste inconnu", 
        cover: "",
        filename: fileName 
    }
}

// 4. Déclaration de toutes les routes API
app.get('/current-track', (req, res) => {
    if (playlist.length === 0) {
        return res.json({ name: "Chargement...", author: "", cover: "" })
    }

    const trackPath = playlist[currentTrackIndex]
    const trackInfo = getTrackInfoFromJSON(trackPath) 
    
    res.json(trackInfo)
})

app.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-store'
    })

    clients.add(res)
    console.log(styleText(['bold', 'green'], `Listener connected (${clients.size} total)`))
    broadcastListenerCount();

    req.on('close', () => {
        clients.delete(res)
        console.log(styleText(['bold', 'red'], `Listener left (${clients.size} total)`))
        broadcastListenerCount();
    });
});


app.use(cors())

app.use(express.static(path.join(import.meta.dirname, 'public')))

// 6. Lancement du serveur ET du WebSocket
const server = app.listen(PORT, () => {
    console.log(`Radio running at http://localhost:${PORT}`)
})

// On attache un unique WebSocket à notre serveur web (infos radio + chat)
wss = new WebSocketServer({ server })

const historique = [];


wss.on('connection', (ws) => {
    console.log(styleText(['bold', 'cyan'], '🔌 Un client Web est connecté pour les infos !'))

    // On lui envoie directement la musique en cours pour ne pas attendre la suivante
    if (playlist.length > 0) {
        const trackPath = playlist[currentTrackIndex]
        const trackInfo = getTrackInfoFromJSON(trackPath) 
        ws.send(JSON.stringify({
            type: 'track',
            data: trackInfo
        }))
    }

    ws.send(JSON.stringify({
        type: 'listeners',
        count: clients.size
    }))

    // Envoyer l'historique du chat au nouveau client
    historique.forEach((msg) => {
        ws.send(msg);
    });

    ws.on('message', (message) => {
        const texte = message.toString();
        console.log(`message reçu: ${texte}`);

        // Sauvegarder le message dans l'historique
        historique.push(texte);

        const data = JSON.parse(texte);
        const estUnGif = data && data.type === 'gif';
        const contientLienInterdit = texte.includes("<") || texte.includes(">") || texte.includes("http") || texte.includes(".com");

        // 3. On utilise bien ws.clients ici aussi
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                if (contientLienInterdit && !estUnGif) {
                    client.send(JSON.stringify({
                        id : 0,
                        nickname : "Bot",
                        text : "Impossible d'envoyer ce message !",
                        timestamp : Date.now()
                    }));
                } else {
                    client.send(texte);
                }
                
            }
        });
    });

    ws.on('close', () => {
        console.log(styleText(['bold', 'magenta'], '❌ Un client Web a fermé la page'))
    })
})

// On charge la playlist puis on lance le son
await loadPlaylist()
await loadJingles();
playTrack(currentTrackIndex)


//Temporairze 


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const commande = input.trim().toLowerCase();

    if (commande === 'skip' || commande === 'next') {
        if (ffmpegProcess) {
            console.log(styleText(['bold', 'magenta'], '⏭  Skip demandé, passage direct au titre suivant...'));
            // Tuer le processus déclenche automatiquement l'événement 'close' de ffmpeg
            ffmpegProcess.kill('SIGKILL'); 
        } else {
            console.log(styleText(['bold', 'yellow'], 'Aucune musique en cours de lecture.'));
        }
    }
});