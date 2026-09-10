import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { W } from 'vue-router/dist/index-D7ja2BKs.js';

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

    console.log("Tous les likes :")
    console.log(likesArray.value)
    console.log("-----------------------")
  }

  loadLikesSongs()

  return { likesArray, loadLikesSongs, like, dislike }
})

