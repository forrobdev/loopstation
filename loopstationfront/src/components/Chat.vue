<script>

</script>

<template>
    
    <div id="chatZone">
        <div id="chatBox">
            <div id="messages"></div>
        </div>
        <input type="text" id="messageInput" placeholder="Votre message">
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