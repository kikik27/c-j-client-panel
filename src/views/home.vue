<template>
  <div>
    <div class="relative w-full overflow-hidden">
      <div ref="sliderRef" class="flex overflow-x-auto scroll-smooth snap-x snap-mandatory slider-container">
        <div class="w-3/4 snap-start p-2" v-for="product in products" :key="product.id">
          <div class="bg-white p-6 rounded-lg shadow-lg">{{ product.name }}</div>
          <img v-if="product.catalog_images && product.catalog_images.length > 0" :src="`https://demo.devaro.store/storage/${product.catalog_images[0].image}`"
            :alt="product.name" class="w-full h-auto object-cover rounded-lg mt-2">
        </div>
      </div>
      <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        <button v-for="(_, index) in products" :key="index" @click="goToSlide(index)" class="w-3 h-3 rounded-full"
          :class="currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'"></button>
      </div>
    </div>
  </div>
</template>

<style>
.slider-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.slider-container::-webkit-scrollbar {
  display: none;
}
</style>

<script setup>
import { useProductStore } from "@/stores/product";
import { onMounted, ref, onUnmounted, computed } from "vue";

const productStore = useProductStore();
const products = ref([]);
const sliderRef = ref(null);
const currentSlide = ref(0);
const sliderInterval = ref(null);
const isLoading = ref(true);

// Fetch products from store
onMounted(async () => {
  try {
    isLoading.value = true;
    await productStore.getProduct();
    products.value = computed(() => productStore.products).value;

    // Start auto-sliding after a short delay to ensure DOM is ready
    setTimeout(() => {
      startAutoSlide();
    }, 100);
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    isLoading.value = false;
  }
});

// Clear interval when component is unmounted
onUnmounted(() => {
  if (sliderInterval.value) {
    clearInterval(sliderInterval.value);
  }
});

// Start auto-sliding
function startAutoSlide() {
  if (!sliderRef.value || products.value.length <= 1) return;

  const slideWidth = sliderRef.value.children[0].offsetWidth;
  const totalSlides = products.value.length;

  sliderInterval.value = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % totalSlides;
    goToSlide(currentSlide.value);
  }, 3000);
}

// Go to specific slide
function goToSlide(index) {
  if (!sliderRef.value) return;

  const slideWidth = sliderRef.value.children[0].offsetWidth;
  sliderRef.value.scrollTo({
    left: index * slideWidth,
    behavior: "smooth"
  });
  currentSlide.value = index;
}
</script>