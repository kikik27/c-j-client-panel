<script setup>
import { Icon } from "@iconify/vue";
import { useProductStore } from "@/stores/product";
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import router from '@/router';
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { useCartStore } from "@/stores/cart";
import { useDialog } from '@/utils/useDialog';
const dialog =  useDialog();
import success from '@/assets/lottie-success.json'

const cartStore = useCartStore();
const productStore = useProductStore();
const isLoading = ref(true);
const userData = ref(null)
const product = ref({});
const isModalVisible = ref(false);
const isScrolled = ref(false);
const scrolContainer = ref(null)

onMounted(async () => {
  await initialLoad()
  cartStore.loadCart()
  handleScroll()
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(scrolContainer, (newVal) => {
  if (newVal) {
    newVal.addEventListener('scroll', handleScroll);
  }
}, { immediate: true });


const showSuccessModal = () => {
  isModalVisible.value = true;
  setTimeout(() => {
    isModalVisible.value = false;
  }, 1000);
};

const handleScroll = () => {
  if (scrolContainer.value) {
    isScrolled.value = scrolContainer.value.scrollTop > 10;
  }
};

const initialLoad = async () => {
  isLoading.value = true;
  const { id } = router.currentRoute.value.params
  try {
    await productStore.getProductDetail(atob(id));
    product.value = productStore.product
  } catch (error) {
    console.error("Error loading initial products:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatMoney = (value, currency = "IDR", locale = "id") => {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
};


const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    setTimeout(() => {
      document.getElementById('search-input').focus();
    }, 100);
  }
};

const loadUserSaveData = () => {
  try {
    console.log("user data loaded")
    userData.value = JSON.parse(Cookies.get("user") || null);
  } catch {
    Cookies.set("user", []);
  }
}

const numberFormatter = (number) => {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  }
  return number.toString();
}

const handleAddToCart = async (product) => {
  try {
    cartStore.addToCart(product);
    dialog.open({
      title: 'Ditambahkan ke keranjang.',
      animation: success,
      showCancelButton: false,
      showConfirmButton: false,
      duration: 2000
    })
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};
</script>
<template>
  <div class="overflow-y-auto overscroll-contain h-screen w-full flex flex-col gap-4" ref="scrolContainer">
    <div class="fixed z-99 top-0 p-4 flex w-full max-w-[480px] justify-between"
      :class="{ 'bg-white shadow-xl': isScrolled, 'bg-transparent': !isScrolled }">
      <button @click="router.back() ?? router.push('/')" :class="{ 'shadow-none': isScrolled }"
        class="bg-white shadow-lg p-3 rounded-full px-4">
        <Icon icon="weui:back-filled" class="text-black"></Icon>
      </button>
      <a href="/carts" class="shadow-lg p-3 bg-yellow-400 rounded-lg">
        <Icon icon="mdi:cart" class="text-white"></Icon>
        <p
          class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 flex items-center justify-center rounded-full min-w-5 h-5">
          {{ cartStore.items.length }}
        </p>
      </a>
    </div>
    <div class="relative">
      <div v-if="isLoading" class="animate-pulse bg-gray-300 w-full h-64"></div>
      <Swiper v-else-if="product.catalog_images && product.catalog_images.length && !isLoading"
        :modules="[Pagination, Autoplay]" :slides-per-view="1" :loop="true"
        :autoplay="{ delay: 3000, disableOnInteraction: false }" :pagination="{ clickable: true }" class="w-full h-64">
        <SwiperSlide v-for="(image, index) in product.catalog_images" :key="index">
          <img v-lazy="image.image_url" alt="Product Image"
            class="w-full h-64 object-cover" />
        </SwiperSlide>
      </Swiper>


      <!-- Fallback jika tidak ada katalog -->
      <img v-else v-lazy="`https://storage.googleapis.com/a1aa/image/xkZ4b5-ggWWw2S9PTnL8XdnGUhYKRjLiDBpDfRwv6rM.jpg`"
        alt="Default Image" class="w-full h-64 object-cover" />
      <div v-if="!isLoading && product.sales_count !== null"
        class="absolute z-50 bottom-2 shadow-lg right-2 bg-red-500 flex gap-2 text-white items-center text-xs px-2 py-1 rounded-full">
        <p>Terjual {{ product.sales_count ? numberFormatter(product.sales_count) : product.sales_count }}</p>
      </div>
    </div>
    <div class="px-4 grid grid-cols-1 gap-4">
      <div v-if="isLoading">
        <div class="animate-pulse h-6 bg-gray-300 w-2/3 mb-2"></div>
        <div class="animate-pulse h-4 bg-gray-300 w-1/3"></div>
      </div>
      <div v-else>
        <h2 class="text-lg capitalize mb-1 font-bold">
          {{ product.name }}
        </h2>
        <h2 class="text-sm capitalize mb-2 truncate text-red-400">
          {{ formatMoney(product.price) }}
        </h2>
      </div>

      <hr class="text-gray-400">

      <div v-if="isLoading">
        <div class="animate-pulse h-6 bg-gray-300 w-2/3 mb-2"></div>
        <div class="animate-pulse h-4 bg-gray-300 w-full mb-1"></div>
        <div class="animate-pulse h-4 bg-gray-300 w-full"></div>
      </div>
      <div v-else>
        <h1 class="text-lg capitalize font-bold">Tentang Produk</h1>
        <div v-html="product.description" id="desc" class="text-md v-html mt-2 mb-24 capitalize"></div>
      </div>
    </div>

    <div class="fixed bottom-0 w-full max-w-[480px] flex items-center justify-between gap-2 p-4 z-50">
      <button @click="handleAddToCart(product)" :disabled="isLoading"
        class="w-full p-4 bg-yellow-500 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white text-sm text-center rounded-lg">
        Masukkan Keranjang
      </button>
      <button :disabled="isLoading"
        class="w-full p-4 text-sm disabled:bg-red-400 disabled:cursor-not-allowed bg-red-500 text-white text-center rounded-lg">
        Beli Sekarang
      </button>
    </div>

    <div v-if="isModalVisible" class="fixed inset-0 flex items-center justify-center bg-black/5 bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Icon icon="mdi:check-circle" class="text-green-500 text-4xl mb-2" />
        <p class="text-lg font-semibold">Berhasil ditambahkan!</p>
      </div>
    </div>

  </div>
</template>
<style scoped>
:deep(.swiper-pagination-bullet) {
  background-color: #FFD700 !important;
  /* Ganti dengan warna yang diinginkan */
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #FFA500 !important;
  /* Warna bullet aktif */
  opacity: 1;
}

ul {
  list-style: disc !important;
  padding-left: 20px !important;
  margin-left: 15px !important;
}

ol {
  list-style: decimal !important;
  padding-left: 20px !important;
  margin-left: 15px !important;
}


li {
  display: list-item !important;
  margin-bottom: 5px !important;
}
</style>