<template>
  <Transition name="dialog-fade" appear @before-enter="beforeEnter" @leave="startLeaving" @after-leave="afterLeave">
    <div v-if="modelValue || isLeaving"
      class="fixed inset-0 z-99 flex items-center justify-center bg-black/15 transition-opacity duration-300">
      <div :class="[
        'bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300',
        panelClass,
        isLeaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      ]">
        <div v-if="animation" class="w-full w-40 h-40">
          <Vue3Lottie :animationData="animation" />
        </div>

        <h2 class="text-xl font-semibold text-center mb-2">{{ title }}</h2>
        <p class="text-gray-600 text-center mb-4">{{ description }}</p>
        
        <slot />

        <div class="mt-6 flex justify-between gap-4">
          <button v-if="showCancelButton" class="px-4 py-2 w-full text-sm bg-gray-100 rounded hover:bg-gray-200"
            @click="handleCancel">
            {{ cancelButtonText }}
          </button>
          <button v-if="showConfirmButton"
            :class="['px-4 py-2 text-sm w-full rounded text-white', confirmButtonClass || 'bg-red-400 hover:bg-red-500']"
            @click="handleConfirm">
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  description: String,
  confirmButtonText: String,
  cancelButtonText: String,
  showCancelButton: Boolean,
  showConfirmButton: Boolean,
  confirmButtonClass: String,
  panelClass: String,
  persistent: Boolean,
  onConfirm: Function,
  onCancel: Function,
  animation: Object
})

const isLeaving = ref(false)

const handleConfirm = () => {
  isLeaving.value = true
  setTimeout(() => {
    props.onConfirm?.()
  }, 300) // delay biar animasi selesai
}

const handleCancel = () => {
  isLeaving.value = true
  setTimeout(() => {
    props.onCancel?.()
  }, 300)
}

const beforeEnter = () => {
  isLeaving.value = false
}

const startLeaving = () => {
  isLeaving.value = true
}

const afterLeave = () => {
  isLeaving.value = false
}
</script>
