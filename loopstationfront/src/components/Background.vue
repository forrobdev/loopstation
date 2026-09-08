<script>
const canvas = document.getElementById('visualizer-canvas');

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

</script>


<template>

<canvas id="visualizer-canvas" width="800" height="600" style="background: black;"></canvas>

</template>

<style>



</style>