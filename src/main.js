import './assets/main.css'
import VueLazyLoad from 'vue3-lazyload'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Lottie from 'vue3-lottie'
import { DialogPlugin } from './plugins/dialog'


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueLazyLoad)
app.use(Vue3Lottie)
app.use(DialogPlugin);

app.mount('#app')
