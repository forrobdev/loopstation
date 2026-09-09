<script setup>
    import {ref, onMounted, nextTick} from 'vue';

    let pseudo = 'Anonyme';
    const chatButton = document.querySelector("#chat");

    async function chargerPseudo() {
        const reponse = await fetch('pseudos.json');
        const data = await reponse.json();
        pseudo = data.pseudos[Math.floor(Math.random() * data.pseudos.length)];

        console.log("Pseudo :" + pseudo)

        localStorage.setItem("pseudo", pseudo)
    }
    onMounted (async() => {
        if (localStorage.getItem("pseudo") == null) {
            await chargerPseudo()
        } else {
            pseudo = localStorage.getItem("pseudo")
            console.log("Pseudo :" + pseudo)
        }
    })
    


</script>

<template>
    
    <div id="chatZone">
        <div id="chatBox" class="white" @click ="toggleChat">
            <div id="messages"></div>
        </div>
        <input type="text" id="messageInput" class="white" placeholder="Votre message">
    </div>

</template>

<style>

#chatZone {
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap : 10px;

    position: fixed;
    bottom: 50px;
    right: 50px;

    z-index: 10;
}

#chatBox {
    width: 280px;
    height: 350px;
    overflow-y: auto;
    background-color: #ffffff;
    border-radius: 18px;
    padding: 15px 20px;
}

#chatBox p {
    margin: 5px 0;
    font-size: 18px;
}

#messageInput {
    width : 280px;
    border: solid #CACACA 1px;
    border-radius: 18px;
    padding: 10px 10px;
    background-color: #ffffff;
    color : black;
    outline: #FFBF00;
}

</style>