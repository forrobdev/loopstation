<script>


</script>


<template>

<div id="musicPlayingParent">
    <div id="musicPlaying" class="white">
        <div id="nowPlaying">
            <p>Now playing</p>
        </div>
        <img id="cover" src="" alt="Pochette de l'album">
        <p id="name">Nom de la musique</p>
        <p id="author">Artiste</p>
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