<script setup>
import notFound from '@/assets/404.json'
import { Icon } from "@iconify/vue";
import { useProductStore } from "@/stores/product";
import { onMounted, ref, onUnmounted, computed, watch } from "vue";
import Cookies from "js-cookie";
import { useInfiniteScroll } from "@vueuse/core";
import router from '@/router';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();
const productStore = useProductStore();
const products = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const page = ref(1);
const limit = ref(6);
const isLast = ref(false);
const isFetching = ref(false);
const scrollContainerRef = ref(null);
const showSearch = ref(false);
const userData = ref(null)

onMounted(async () => {
  cartStore.loadCart()
  await initialLoad();
  if(isLoading){
    useInfiniteScroll(
      scrollContainerRef,
      async () => {
        if (!isFetching.value && !isLast.value) {
          await loadMore();
        }
      },
      { distance: 10 }
    );
  }
});
watch(searchQuery, async (newQuery) => {
  // Reset pagination and products when search changes
  page.value = 1;
  products.value = [];
  isLast.value = false;
  isLoading.value = true;
  console.log("SEARCHIng")
  try {
    const res = await productStore.getProduct({
      page: page.value,
      limit: limit.value,
      search: newQuery
    });
    products.value = [...productStore.products];
    isLast.value = res.data.next_page_url === null;
    if (res.data.next_page_url !== null) {
      page.value += 1;
    }
  } catch (error) {
    console.error("Error searching products:", error);
  } finally {
    isLoading.value = false;
  }
}, { debounce: 1000 });

const initialLoad = async () => {
  isLoading.value = true;
  try {
    const res = await productStore.getProduct({ page: page.value, limit: limit.value, search: searchQuery.value });
    products.value = [...productStore.products];
    isLast.value = res.data.next_page_url === null;
    if (res.data.next_page_url !== null) {
      page.value += 1;
    }
  } catch (error) {
    console.error("Error loading initial products:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
  // Don't fetch if already fetching or at the last page
  if (isFetching.value || isLast.value) return;

  isFetching.value = true;
  try {
    const res = await productStore.getProduct({ page: page.value, limit: limit.value, search: '' });
    products.value = [...products.value, ...productStore.products];

    // Update isLast flag and page number
    isLast.value = res.data.next_page_url === null;
    if (res.data.next_page_url !== null) {
      page.value += 1;
    }
  } catch (error) {
    console.error("Error loading more products:", error);
  } finally {
    isFetching.value = false;
  }
};

const formatMoney = (value, currency = "IDR", locale = "id") => {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
};

const itemInChart = (id) => {
  const item = cartItems.value.find((item) => item.id === id);
  return item ? item.qty : 0;
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    // Focus on search input when shown
    setTimeout(() => {
      document.getElementById('search-input').focus();
    }, 100);
  }
};

// Scroll to top function
const scrollToTop = () => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const rankedProducts = computed(() => {
  return [...products.value]
    .sort((a, b) => b.count_sale - a.count_sale)
    .map((product, index) => ({
      ...product,
      rank: index + 1
    }));
});

const navigateToDetail = (id) => {
  const encodedID = btoa(id);
  router.push(`detail/${encodedID}`);
};
</script>

<template>
  <div class="overflow-y-auto overscroll-contain h-screen w-full" ref="scrollContainerRef">
    <div class="sticky top-0 z-50 bg-white shadow-md">
      <div class="flex justify-between w-full px-4 py-3 items-center">
        <div class="flex items-center gap-2">
          <div class="border-1 p-2 rounded-full">
            <Icon icon="mdi:user"></Icon>
          </div>
          <div class="text-sm capitalize font-normal" v-if="userData != null">
            <p>{{ userData.name ?? 'Customer' }} | {{ userData.phone ?? '+62..' }}</p>
            <p>{{ userData.address }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button @click="toggleSearch" class="p-3 rounded-lg bg-gray-100 hover:bg-gray-200">
            <Icon icon="mdi:magnify" class="text-gray-700"></Icon>
          </button>
          <a href="/carts" class="relative p-3 bg-yellow-400 rounded-lg">
            <Icon icon="mdi:cart" class="text-white"></Icon>
            <p
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 flex items-center justify-center rounded-full min-w-5 h-5">
              {{ cartStore.items.length }}
            </p>
          </a>
        </div>
      </div>

      <!-- Search input -->
      <div v-if="showSearch" class="px-4 pb-3 transition-all duration-300">
        <div class="relative">
          <input id="search-input" v-model="searchQuery" type="text" placeholder="Search products..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <Icon icon="mdi:magnify" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon icon="mdi:close" />
          </button>
        </div>
      </div>
    </div>
    <div class="container mx-auto p-4">
      <h2 class="w-full text-xl text-center font-bold mb-4">
        Form Order
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <!-- Real products -->
        <div v-for="product in rankedProducts" :key="product.id" class="bg-white rounded-lg shadow-lg flex flex-col h-full"
          v-if="products.length > 0 || !isLoading" @click="navigateToDetail(product.id)">

          <div class="relative">
            <div v-if="product.rank <= 10" class="absolute top-2 left-2 bg-red-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              #{{ product.rank }}
            </div>
            <img
              v-lazy="`${product.catalog_images[0]?.image ? product.catalog_images[0]?.image_url : 'https://storage.googleapis.com/a1aa/image/xkZ4b5-ggWWw2S9PTnL8XdnGUhYKRjLiDBpDfRwv6rM.jpg'}`"
              :alt="product.name" class="w-full h-48 object-cover" />
          </div>

          <div class="flex flex-col flex-grow p-4 pb-6 relative">
            <h2 class="text-md capitalize font-semibold line-clamp-2">
              {{ product.name }}
            </h2>
          </div>

          <div class="p-2 pl-4 bg-yellow-500 rounded-b-lg">
            <h2 class="text-sm text-white font-semibold">
              {{ formatMoney(product.price) }}
            </h2>
          </div>

        </div>

        <!-- Skeleton cards for initial loading -->
        <div v-if="isLoading" v-for="i in 4" :key="`skeleton-initial-${i}`"
          class="bg-white rounded-lg shadow-md animate-pulse rounded-t-lg">
          <div class="relative">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="absolute top-2 shadow-lg left-2 bg-gray-100 w-12 h-6 rounded-full"></div>
            <div class="absolute top-2 shadow-lg right-2 bg-gray-100 w-24 h-6 rounded-full"></div>
          </div>
          <div class="p-4 pb-6 relative">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div class="p-2 pl-4 bg-gray-200 rounded-b-lg">
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>

        <!-- Skeleton cards for loading more -->
        <div v-if="isFetching && !isLoading" v-for="i in 2" :key="`skeleton-more-${i}`"
          class="bg-white rounded-lg shadow-md animate-pulse rounded-t-lg">
          <div class="relative">
            <div class="w-full h-48 bg-gray-200"></div>
            <div class="absolute top-2 shadow-lg left-2 bg-gray-100 w-12 h-6 rounded-full"></div>
            <div class="absolute top-2 shadow-lg right-2 bg-gray-100 w-24 h-6 rounded-full"></div>
          </div>
          <div class="p-4 pb-6 relative">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div class="p-2 pl-4 bg-gray-200 rounded-b-lg">
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- End of products indicator -->
      <div v-if="isLast && products.length > 0 && !isLoading && !isFetching" class="text-center py-4">
        <p class="text-gray-500">No more products to load</p>
      </div>

      <div v-if="!isLoading && products.length === 0" class="flex flex-col items-center justify-center py-10">
        <Vue3Lottie :animationData="notFound" :loop="true" :autoplay="true" style="width: 200px; height: 200px;" />
        <p class="text-gray-500 mt-4">Produk tidak ditemukan</p>
      </div>

      <div class="fixed z-99 bottom-4 right-4">
        <button v-show="scrollContainerRef?.scrollTop > 10" @click="scrollToTop"
          class="bg-red-500 text-white p-4 rounded-full shadow-lg">
          <Icon icon="mingcute:up-fill"></Icon>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>