<script setup>
    import {ref, onMounted, nextTick} from 'vue';
    import { PhPlay, PhPause, PhChatsCircle, PhHeart } from "@phosphor-icons/vue";
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

    // function unLikesSongs (song) {
    //     let indexRemove = -1;


    //     for(let i = 0 ; i < likesSongs.value.length  ; i = i + 1 ) {
    //         if (likesSongs.value[i].name === song.name && likesSongs.value[i].author === song.author) {
    //             indexRemove = i;
    //         };
    //     };

    //     if(indexRemove !== -1) {
    //         likesSongs.value.splice(indexRemove, 1);
    //         localStorage.setItem("likes", JSON.stringify(likesSongs.value))
    //     };

    // };


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
                        <!-- <div @click = "unLikesSongs(song)" class="action white unlike">
                                <PhHeart :size="20" weight="fill" />
                        </div> -->
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


.unlike {
    display : flex;
    justify-content: center;
    align-items: center;
    gap: 30px;

    
    width:  30px;
    height: 30px;
    height: fit-content;
}

</style>