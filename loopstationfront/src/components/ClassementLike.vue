<script setup>
    import {ref, onMounted, nextTick} from 'vue';
    import { PhPlay, PhPause, PhChatsCircle, PhHeart } from "@phosphor-icons/vue";
    import {gsap} from 'gsap';
    import buttonSource from "../assets/button.mp3"
    import { likeManager } from "../stores/counter"




    const buttonSound = new Audio(buttonSource)
    
    const likesStore = likeManager()




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
        gsap.to("#likesZone", {
            duration : 0,
            ease : "power4.out",
            y : 280
        })
    });

    let likesOpened = ref(false)

    function openLikes() {

        buttonSound.play()

        if (likesOpened.value) {
            gsap.to("#likesZone", {
                duration : 0.3,
                ease : "power4.out",
                y : 280
            })

            likesOpened.value = !likesOpened.value
        } else {
            gsap.to("#likesZone", {
                duration : 0.3,
                ease : "power4.out",
                y : 0
            })

            likesOpened.value = !likesOpened.value
        }
        
    }



    // function dislike(musicName,musicAuthor, event) {

    //     buttonSound.play()

    //     const allLikes = JSON.parse(localStorage.getItem("likes")) ?? []

    //     const index = allLikes.findIndex(music => 
    //         music.name === musicName && 
    //         music.author === musicAuthor
    //     )

    //     allLikes.splice(index, 1)

    //     localStorage.setItem("likes",JSON.stringify(allLikes))

    //     console.log("Tous les likes :")
    //     console.log(allLikes)
    //     console.log("-----------------------")

    //     gsap.to(event.currentTarget.closest('.likedMusic'), {
    //         duration : 0.3,
    //         ease : "power4.out",
    //         opacity : 0,
    //         x : -200
    //     })
    // }

    function addMusicAnim(el, done) {
        gsap.fromTo(el, {
            opacity: 0, x: -200
        }, {
            duration : 0.3,
            ease : "power4.out",
            opacity : 1,
            x : 0,
            onComplete : done
        })
        
    }

    function deletedMusicAnim(el, done) {
        gsap.fromTo(el, {
            opacity: 1, x: 0
        }, {
            duration : 0.3,
            ease : "power4.out",
            opacity : 0,
            x : 200,
            onComplete : done
        })
        
    }
        
</script>


<template>
    <div id="likesZone">

        <div @click="openLikes" class="white title" v-if="likesStore.likesArray.length > 0">
            <p>My favorite songs</p>
        </div>

        
        <div id="allLikedMusic" v-if="likesOpened">

            <TransitionGroup @enter="addMusicAnim" @leave="deletedMusicAnim" :css="false">

                <div v-for="song in likesStore.likesArray" :key="song.name + song.author" class="likedMusic white">
                    <img :src="song.cover" :alt="song.name" class="likedCover">
                    <div class="likedRight">
                        <p class="likedName">{{ song.name }}</p>
                        <p class="likedAuthor">{{ song.author }}</p>
                    </div>

                    <PhHeart @click="likesStore.dislike(song.name, song.author)" id="likeIcon" :size="22" weight="fill" />
                </div>

            </TransitionGroup>

        </div>

        

        

    </div>
</template>

<style>

.title {
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 100px;
}

#likesZone {
    padding-top: 50px;
    position: fixed;
    left: 20px;
    bottom: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 400px;
    width: 400px;
    z-index: 20;
    gap: 10px;
}

#allLikedMusic {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    height: 400px;
    width: 400px;
    overflow: scroll;
    padding: 30px 0;
}



.likedMusic {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 280px;
    height: 130px;
    border-radius: 18px;
    padding: 15px;
    gap: 20px;
}

.likedCover {
    height: 100px;
    width: 100px;
    border-radius: 8px;
}

.likedName {
    color: #FFBF00;
    font-size: 20px;
}

.likedAuthor {
    font-size: 16px;
}

#likeIcon {
    position: absolute;
    right: 20px;
    bottom: 20px;
    cursor: pointer;
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