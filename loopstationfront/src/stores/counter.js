import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { playerManager } from "../stores/playerManager"
import buttonSource from "../assets/button.mp3"
    
const buttonSound = new Audio(buttonSource)


export const likeManager = defineStore('likeManager', () => {
  const likesArray = ref(["test","test2"])

  function loadLikesSongs(){ 
    const data = localStorage.getItem('likes');

    if (data) {
        likesArray.value = JSON.parse(data) 
    } else {
        likesArray.value = [];   
    }
  }

  function like(musicName,musicAuthor,musicCover) {
    likesArray.value.push({
      name : musicName,
      author : musicAuthor,
      cover : musicCover
    })

    localStorage.setItem("likes",JSON.stringify(likesArray.value))

    buttonSound.play()
    
    console.log("Tous les likes :")
    console.log(likesArray.value)
    console.log("-----------------------")
  }

  function dislike(musicName,musicAuthor) {
    const index = likesArray.value.findIndex(music => 
      music.name === musicName && 
      music.author === musicAuthor
    )

    likesArray.value.splice(index, 1)

    localStorage.setItem("likes",JSON.stringify(likesArray.value))

    buttonSound.play()

    console.log("Tous les likes :")
    console.log(likesArray.value)
    console.log("-----------------------")
  }

  const playerStore = playerManager()

  const isCurrentMusicLiked = computed(() => {
    const currentMusic = playerStore.currentMusic
    console.log("likesArray :", likesArray.value)
    console.log("currentMusic :", currentMusic)
    return likesArray.value.some(music => 
      music.name === currentMusic.name && 
      music.author === currentMusic.author
    );
  });

  loadLikesSongs()

  return { likesArray, loadLikesSongs, like, dislike, isCurrentMusicLiked }
})

