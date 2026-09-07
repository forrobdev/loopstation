import express from "express"
import path from "node:path"
import fs from 'node:fs'
import {spawn} from "node:child_process"
import cors from "cors"
import {styleText} from 'node:util'

const app = express()
const PORT = 3000

let playlist = []
let currentTrackIndex = 0
let ffmpegProcess = null
const clients = new Set()
let tracksInfos = []

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

    // Spawn FFmpeg to convert this single file to a standard MP3 stream
    ffmpegProcess = spawn('ffmpeg', [
        '-re',                // Read at native speed (real-time)
        '-i', trackPath,
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
    const fileName = path.basename(trackPath) // ex: "music0.mp3"

    const match = fileName.match(/\d+/)
    
    const trackIdToFind = match ? parseInt(match[0], 10) : null

    const track = tracksInfos.find(t => t.track_id === trackIdToFind)

    return track || { 
        name: "Titre inconnu", 
        author: "Artiste inconnu", 
        cover: "",
        filename: fileName 
    }
}

// 4. Déclaration de toutes les routes API
// Envoyer les infos de la musique en cours
app.get('/current-track', (req, res) => {
    // Évite une erreur si la playlist n'est pas encore chargée
    if (playlist.length === 0) {
        return res.json({ name: "Chargement...", author: "", cover: "" })
    }

    const trackPath = playlist[currentTrackIndex]
    const trackInfo = getTrackInfoFromJSON(trackPath) 
    
    res.json(trackInfo)
})

// HTTP Stream Endpoint for browsers
app.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-store'
    })

    // Add this client to our broadcast list
    clients.add(res)
    console.log(styleText(['bold', 'green'], `Listener connected (${clients.size} total)`))

    // Remove client when they close the tab/stop playing
    req.on('close', () => {
        clients.delete(res)
        console.log(styleText(['bold', 'red'], `Listener left (${clients.size} total)`))
    });
});

// 5. Middlewares
app.use(cors())
// Serve the static frontend
app.use(express.static(path.join(import.meta.dirname, 'public')))

// 6. Lancement du serveur (toujours à la fin)
await loadPlaylist()
playTrack(currentTrackIndex) // Start the stream loop immediately

app.listen(PORT, () => {
    console.log(`Radio running at http://localhost:${PORT}`)
})