import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


export const playerManager = defineStore('playerManager', () => {
  const currentMusic = ref({
        name:"",
        author:"",
        cover:""
    })


  return { currentMusic }
})

