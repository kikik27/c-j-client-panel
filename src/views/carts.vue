<script setup>
import { Icon } from "@iconify/vue";
import { useProductStore } from "@/stores/product";
import { onMounted, onUnmounted, ref, watch } from "vue";
import Cookies from "js-cookie";
import router from '@/router';
import notFound from '@/assets/404.json'



const productStore = useProductStore();
const cartItems = ref([]);
const cartCount = ref(0);
const isLoading = ref(true);
const userData = ref(null)
const product = ref({});
const isModalVisible = ref(false);
const isScrolled = ref(false);
const scrolContainer = ref(null)

onMounted(async () => {
  updateCart();
  await initialLoad();
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

const saveToCart = (product) => {
  let cart = JSON.parse(Cookies.get("cart") || "[]");
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }
  Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
  updateCart();
  showSuccessModal();
};

const updateCart = () => {
  try {

    cartItems.value = JSON.parse(Cookies.get("cart") || "[]");
    cartCount.value = cartItems.value.reduce((total, item) => total + item.qty, 0);
  } catch {
    Cookies.set("cart", []);
  }
};

const formatMoney = (value, currency = "IDR", locale = "id") => {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
};

const itemInChart = (id) => {
  const item = cartItems.value.find((item) => item.id === id);
  return item ? item.qty : 0;
};

const getSalesRank = (product) => {
  if (product.sales_count === null) return null;
  const sortedProducts = [...product.value]
    .filter(p => p.sales_count !== null)
    .sort((a, b) => b.sales_count - a.sales_count);
  const position = sortedProducts.findIndex(p => p.id === product.id);
  return position !== -1 ? position + 1 : null;
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
</script>
<template>
  <div class="overflow-y-auto overscroll-contain h-screen w-full flex flex-col gap-4" ref="scrolContainer">
    <div class="p-4 flex w-full max-w-[480px] items-center"
      :class="{ 'bg-white shadow-xl fixed z-99 top-0 ': isScrolled, 'bg-transparent': !isScrolled }">
      <button @click="router.back() ?? router.push('/')" :class="{ 'shadow-none': isScrolled }"
        class="p-3 rounded-full px-4">
        <Icon icon="weui:back-filled" class="text-black"></Icon>
      </button>
      <h2 class="text-lg font-bold">
        Keranjang Saya <span class="text-sm font-normal">( {{ cartItems.length }} )</span>
      </h2>
    </div>

    <div class="px-4 grid grid-cols-1 gap-4">
      <div v-if="isLoading">
        <div class="animate-pulse h-6 bg-gray-300 w-2/3 mb-2"></div>
        <div class="animate-pulse h-4 bg-gray-300 w-1/3"></div>
      </div>
      <div v-else-if="cartItems.length > 0" v-for="item in cartItems" :key="item">
        <div class="flex gap-2 justify-between items-center">
          <div class="flex gap-2">
            <div class="flex items-center gap-2">
              <input type="radio" :value="true" v-model="item.isSelected">
              <img v-lazy="`https://demo.devaro.store/storage/${item.image}`" :alt="product.name"
                class="w-20 rounded-lg object-cover" />
            </div>
            <div>
              <h2 class="font-medium text-base capitalize line-clamp-2">
                {{ item.name }}
              </h2>
              <input type="number" min="0" v-model="item.qty">
            </div>
          </div>
          <div>
            {{ formatMoney(item.price * item.qty) }}
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-10">
        <Vue3Lottie :animationData="notFound" :loop="true" :autoplay="true" style="width: 200px; height: 200px;" />
        <p class="text-sm mt-4">Sepertinya keranjangmu kosong</p>
      </div>
    </div>

    <div class="fixed bottom-0 w-full max-w-[480px] flex items-center justify-between gap-2 p-4 z-50">
      <button :disabled="isLoading || cartItems.length === 0"
        class="w-full p-4 text-sm bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400 text-white text-center rounded-lg">
        Order Sekarang
      </button>
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