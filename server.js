import express from "express"
import path from "node:path"
import fs from 'node:fs'
import {spawn} from "node:child_process"
import cors from "cors"
import {styleText} from 'node:util'
import { WebSocketServer, WebSocket } from 'ws';

const app = express()
const PORT = 3000

let playlist = []
let currentTrackIndex = 0
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

// 2. Stream the current track, then automatically trigger the next
const playTrack = (index) => {
    const trackPath = playlist[index]
    console.log(`▶ Okok, now playing: ${path.basename(trackPath)}`)

    // --- WEBSOCKET : On prévient tout le monde que la musique change ---
    if (wss) {
        const trackInfo = getTrackInfoFromJSON(trackPath)
        const message = JSON.stringify({
            type: 'track',
            data: trackInfo
        })
        
        wss.clients.forEach((client) => {
            // readyState === 1 signifie que la connexion est bien ouverte
            if (client.readyState === 1) { 
                client.send(message)
            }
        })
    }
    // ------------------------------------------------------------------

    // Spawn FFmpeg to convert this single file to a standard MP3 stream
    ffmpegProcess = spawn('ffmpeg', [
        '-re',                // Read at native speed (real-time)
        '-i', trackPath,
        '-vn',                // Ignore la vidéo/image de couverture
        '-f', 'mp3',          // Output format: MP3
        '-c:a', 'libmp3lame', // Encode to MP3
        '-b:a', '128k',       // Constant bitrate
        '-ar', '44100',       // 44.1kHz sample rate
        '-ac', '2',           // Stereo
        'pipe:1'              // Output to stdout
    ])

    // Push the audio chunks to all connected clients
    ffmpegProcess.stdout.on('data', (chunk) => {
        for (const client of clients) {
            client.write(chunk)
        }
    })

    ffmpegProcess.on('close', (code) => {
        ffmpegProcess = null
        // Move to next track (loop back to 0 at the end)
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length
        console.log(`Aaaaaaaaand, are you ready for the next track?`)
        playTrack(currentTrackIndex)
    });
}

// 3. Fonctions utilitaires
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

// 5. Middlewares
app.use(cors())
// Serve the static frontend
app.use(express.static(path.join(import.meta.dirname, 'public')))

// 6. Lancement du serveur ET des WebSockets
const server = app.listen(PORT, () => {
    console.log(`Radio running at http://localhost:${PORT}`)
})

// On attache les WebSockets à notre serveur web
wss = new WebSocketServer({ server })

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

    ws.on('close', () => {
        console.log(styleText(['bold', 'magenta'], '❌ Un client Web a fermé la page'))
    })
})

// On charge la playlist puis on lance le son
await loadPlaylist()
playTrack(currentTrackIndex)

const ws_PORT = 7500;
const wss = new WebSocketServer({ port: ws_PORT });
const historique = [];
console.log(`Le serveur WebSocket est en cours d'exécution sur ws://localhost:${ws_PORT}`);

wss.on('connection', (ws) => {
    console.log('Nouveau client connecté');

    // Envoyer l'historique au nouveau client
    historique.forEach((msg) => {
        ws.send(msg);
    });

    ws.on('message', (message) => {
        const texte = message.toString();
        console.log(`message reçu: ${texte}`);

        // Sauvegarder le message dans l'historique
        historique.push(texte);

        // Diffuser le message à tous les clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(texte);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client déconnecté');
    });
});
