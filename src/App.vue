<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 m-0 p-0">
    <div class="max-w-sm bg-white mobile-container shadow-md h-screen w-full">
      <RouterView />
    </div>
  </div>
</template>
<style>
.mobile-container {
  width: 100%;
  max-width: 420px;
  /* Mobile max width */
  height: 100vh;
  overflow: hidden;
}
</style>