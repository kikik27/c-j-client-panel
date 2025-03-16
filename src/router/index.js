import { createRouter, createWebHistory } from 'vue-router'
import product from '@/views/product/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'product',
      component: product,
    },
  ],
})

export default router
