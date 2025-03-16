import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { globalFetch } from '@/utils/fetch'

export const useProduct = defineStore('product', () => {
  const products = ref()

  async function fetchProducts() {
    globalFetch('/products').then((res) => res.json()).catch((err) => console.error(err))
  }
})
