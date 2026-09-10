<script setup>
    import {ref, onMounted, nextTick} from 'vue';
    import {gsap} from 'gsap';
    
    const likesSongs = ref([]);

    function loadLikesSongs (){ 
        const data = localStorage.getItem('likes');

        if (data) {
            likesSongs.value = JSON.parse(data) 
        } else {
            likesSongs.value = [];   
        }
    };


    onMounted (() => {
        loadLikesSongs();
    });
    
</script>


<template>

    <div id="ClassementZone">
        <div id="ClassementBox">
            <h1>Titres Likées</h1>

            <div v-if="likesSongs.length === 0" class="empty">
                Aucune Music Likées
            </div>


            <ul v-else>
                <li v-for="song in likesSongs" :key=" song.name + song.author">
                    <img :src="song.cover" :alt="song.name" class="cover">
                    <div class="infos">
                        <span class="name">{{ song.name }}</span>
                        <span class="author">{{ song.author }}</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>


</template>

<style>



#ClassementZone {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap : 10px;

    position: fixed;
    bottom: 150px;

    /* z-index: 1; */


}

#ClassementBox {
    width: 280px;
    height: 350px;
    overflow-y: auto;
    background-color: #ffffff;
    border-radius: 18px;
    padding: 15px 20px;
}

.empty {

}

.cover {


}

.infos {


}

.name {


}

.author {



}




</style>