import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


export const chatManager = defineStore('chatManager', () => {
  const chatOpened = ref(false)

  
  return { chatOpened }
})

