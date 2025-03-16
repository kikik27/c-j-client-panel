import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/utils/fetch'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const product = ref([])

  const getProduct = async (params) => {
    const {page, limit, search} = params
    try {
      const response = await api.get(`/products?page=${page ?? 1}&limit=${limit}&best_seller=1&name=${search}`)
      products.value = response.data.data
      return response
    } catch {
      console.error('Error fetching products')
    }
  }

  const getProductDetail = async (id) => {
    try {
      const response = await api.get(`/products/detail/${id}`)
      product.value = response.data
      console.log(product.value)
      return response
    } catch {
      console.error('Error fetching products')
    }
  }

  return {
    getProduct, products, product, getProductDetail
  }
})