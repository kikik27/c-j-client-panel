<template>
  <div>
    <div class="relative w-full overflow-hidden">
      <div id="slider" class="flex overflow-x-auto scroll-smooth snap-x snap-mandatory slider-container">
        <div class="w-3/4 snap-start p-2">
          <div class="bg-white p-6 rounded-lg shadow-lg" v-for="product in products" :key="product.id">{{ product.name
          }}</div>
        </div>
      </div >
    </div>
  </div>
</template>
<style>
.slider-container::-webkit-scrollbar {
  display: none;
}
</style>
<script setup>
import { onMounted, ref } from "vue";
const products = ref([]);

onMounted(() => {

  fetch("http://localhost:8000/api/products")
    .then((response) => response.json())
    .then((json) => (products.value = json.data.data));
  const slider = document.getElementById("slider");
  let scrollAmount = 0;
  const slideWidth = slider.children[0].offsetWidth + 8;

  function autoSlide() {
    scrollAmount += slideWidth;
    if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
      scrollAmount = 0;
    }
    slider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }

  setInterval(autoSlide, 3000);
});
</script>