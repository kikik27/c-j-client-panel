import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/fetch'

export const useProductStore = defineStore('product', () => {
  const products = ref([])

  const getProduct = async () => {
    try {
      const response = await api.get('/products')
      products.value = response.data.data
      return response
    } catch {
      console.error('Error fetching products')
    }
  }

  return {
    getProduct, products
  }
})