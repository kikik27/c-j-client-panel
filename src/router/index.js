import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'product',
      component: () => import('@/views/product/index.vue'),
    },
    {
      path: '/detail/:id',
      name: 'detailProduct',
      component: () => import('@/views/product/detail.vue'),
    },
    {
      path: '/carts',
      name: 'carts',
      component: () => import('@/views/cart.vue'),
    }
  ],
})

router.beforeEach(to => {
  if(!router.hasRoute(to.name)){
    return router.push('/')
  }
})

export default router
