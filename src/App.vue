<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 m-0 p-0">
    <div class="max-w-sm bg-white mobile-container shadow-xl h-screen w-full">
      <RouterView />
    </div>
  </div>
</template>
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

.mobile-container {
  width: 100%;
  max-width: 480px;
  /* Mobile max width */
  height: 100vh;
  overflow: hidden;
}

body {
  font-family: "Nunito", sans-serif;
}
</style>