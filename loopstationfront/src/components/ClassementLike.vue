<script setup>
    import {ref, onMounted, nextTick} from 'vue';
    import {gsap} from 'gsap';
    import buttonSource from "../assets/button.mp3"
    import { likeManager } from "../stores/counter"
    import {PhHeart,PhArrowDown} from "@phosphor-icons/vue";

    const buttonSound = new Audio(buttonSource)
    const likesStore = likeManager()
    let likesOpened = ref(false)


    onMounted (() => {
        gsap.to("#likesZone", {
            duration : 0,
            ease : "power4.out",
            y : 280
        })
    });


    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            if (likesOpened.value) {
                openLikes()
            }
        } 
    });

    function closeLikesOnClickOutside() {
        if (likesOpened.value) {
            openLikes();
        }
    }

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


    function formatDate(timestamp) {

        if (!timestamp) return ""; 

        const date = new Date(timestamp);
        
        return new Intl.DateTimeFormat('en-UK', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }
        
</script>


<template>

    <div v-if="likesOpened" @click="closeLikesOnClickOutside" id="likes-backdrop"></div>


    <div id="likesZone">

        <button @click="openLikes" class="white title" v-if="likesStore.likesArray.length > 0">
            <p v-if="!likesOpened">My favorite songs</p>
            <PhArrowDown v-if="likesOpened" :size="20" weight="bold"/>
        </button>

        
        <div id="allLikedMusic" v-if="likesOpened">

            <TransitionGroup @enter="addMusicAnim" @leave="deletedMusicAnim" :css="false">

                <div v-for="song in likesStore.likesArray" :key="song.name + song.author" class="likedMusic white">
                    <img :src="song.cover" :alt="song.name" class="likedCover">
                    <div class="likedRight">
                        <p class="likedName">{{ song.name }}</p>
                        <p class="likedAuthor">{{ song.author }}</p>
                        <p class="likedDate">{{ formatDate(song.date) }}</p>
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
    color: black;
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

.likedDate {
    color: #CACACA;
    font-size: 12px;
}

#likeIcon {
    position: relative;
    right: -8px;
    bottom: -40px;
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

#likes-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 15;
    background: transparent;
}

@media (max-width: 1120px) {
    #likesZone {
        left: 50%;
        margin-left: -200px;
        bottom: 0%;
    }

    #allLikedMusic {
        background-color: rgba(0, 0, 0, 0.748);
        border-radius: 32px 32px 0 0;
    }
}

</style>