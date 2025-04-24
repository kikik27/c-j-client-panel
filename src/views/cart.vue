<script setup>
import { Icon } from "@iconify/vue";
import { useCartStore } from "@/stores/cart";
import { useProfileStore } from "@/stores/profile";
import { h, markRaw, onMounted, onUnmounted, ref, watch } from "vue";
import router from '@/router';
import notFound from '@/assets/404.json';
import { Vue3Lottie } from 'vue3-lottie';
import { useDialog } from '@/utils/useDialog';
import warning from '@/assets/lottie-warning.json';
import success from '@/assets/lottie-success.json';

const dialog = useDialog();
const cartStore = useCartStore();
const isScrolled = ref(false);
const profileStore = useProfileStore();
const scrollContainer = ref(null);
const isLoading = ref(true);


onMounted(() => {
  loadCartData();
  handleScroll();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(scrollContainer, (newVal) => {
  if (newVal) {
    newVal.addEventListener('scroll', handleScroll);
  }
}, { immediate: true });

const handleScroll = () => {
  if (scrollContainer.value) {
    isScrolled.value = scrollContainer.value.scrollTop > 10;
  }
};

const loadCartData = async () => {
  isLoading.value = true;
  try {
    cartStore.loadCart();
  } catch (error) {
    console.error("Error loading cart data:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatMoney = (value, currency = "IDR", locale = "id") => {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
};

const updateQuantity = (item, newQty) => {
  const quantity = parseInt(newQty);
  if (quantity <= 0) {
    dialog.confirm({
      title: "Hapus Barang",
      description: `Apakah Anda yakin ingin menghapus ${item.name} dari keranjang?`,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      animation: warning
    })
      .then((data) => {
        switch (data) {
          case true:
            cartStore.removeItem(item.id);
            break;
          case false:
            cartStore.updateItemQuantity(item.id, 1);
            break;
        }
      })
      .catch(() => {
        cartStore.updateItemQuantity(item.id, 1);
      });
  } else {
    cartStore.updateItemQuantity(item.id, quantity);
  }
};

const handleCheckout = () => {
  const profile = profileStore.profile
  const selectedAddress = profile.addresses?.find(addr => addr.isSelected)

  // Validasi data profil
  if (!profile.name || !profile.phone) {
    return dialog.confirm({
      title: 'Data Tidak Lengkap',
      description: 'Nama dan nomor telepon wajib diisi di profil Anda.',
      confirmButtonText: 'Lengkapi Profil',
      cancelButtonText: 'Batal',
      animation: warning
    }).then((
      confirmed
    ) => {
      if (confirmed) {
        router.push('/profile')
      }
    })

  }

  if (!selectedAddress || !selectedAddress.value) {
    return dialog.confirm({
      title: 'Alamat Belum Dipilih',
      description: 'Silakan pilih salah satu alamat pengiriman di profil Anda.',
      confirmButtonText: 'Pilih Alamat',
      cancelButtonText: 'Batal',
      animation: warning
    }).then((confirmed) => {
      if (confirmed) {
        router.push('/profile')
      }
    })
  }

  if (cartStore.selectedItems.length === 0) {
    return dialog.confirm({
      title: 'Peringatan',
      description: 'Silakan pilih barang yang ingin dibeli.',
      confirmButtonText: 'OK',
      animation: warning
    })
  }

  // Konten dialog konfirmasi dalam bentuk komponen VNode
  const contentVNode = {
    setup() {
      return () =>
        h('div', { class: 'text-left text-sm leading-relaxed text-gray-700 space-y-2' }, [
          h('p', [h('strong', 'Nama: '), profile.name]),
          h('p', [h('strong', 'No. Telepon: '), profile.phone]),
          h('p', [h('strong', 'Alamat: '), selectedAddress.value])
        ])
    }
  }

  // Tampilkan konfirmasi dengan slot konten Vue
  dialog.confirm({
    title: 'Konfirmasi Pemesanan',
    description: 'Silakan periksa kembali data penerima sebelum melanjutkan.',
    content: markRaw(contentVNode),
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    animation: warning
  }).then(async(confirmed) => {
    if (confirmed) {
      try {
        const res = await cartStore.postCart(profileStore.profile);
        if (res.status === 200) {
          dialog.alert({
            title: 'Berhasil Checkout',
            animation: success,
            description: 'Pesanan Anda telah berhasil diproses.',
            confirmButtonText: 'OK'
          });
          cartStore.clearCart();
          router.push('/orders');
        } else {
          throw new Error('Gagal melakukan checkout.');
        }
      } catch (err) {
        dialog.alert({
          title: 'Gagal Checkout',
          animation: warning,
          description: err.message || 'Terjadi kesalahan saat proses checkout.',
          confirmButtonText: 'OK'
        });
      }
    } else {
      dialog.alert({
        title: 'Dibatalkan',
        description: 'Proses checkout dibatalkan.',
        confirmButtonText: 'OK',
        animation: warning
      })
    }
  }).catch(() => {
    // Cancel dialog
  })
}

const numberFormatter = (number) => {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  }
  return number.toString();
}

</script>

<template>
  <div class="overflow-y-auto overscroll-contain h-screen w-full flex flex-col gap-4" ref="scrollContainer">
    <div class="p-4 flex w-full max-w-[480px] items-center"
      :class="{ 'bg-white shadow-xl fixed z-99 top-0': isScrolled, 'bg-transparent': !isScrolled }">
      <button @click="router.back() ?? router.push('/')" :class="{ 'shadow-none': isScrolled }"
        class="p-3 rounded-full px-4">
        <Icon icon="weui:back-filled" class="text-black"></Icon>
      </button>
      <h2 class="text-lg font-bold">
        Keranjang Saya <span class="text-sm font-semibold">( {{ cartStore.items.length }} )</span>
      </h2>
    </div>

    <form class="px-4 grid grid-cols-1 gap-4 mb-24">
      <div v-if="isLoading">
        <div class="animate-pulse h-6 bg-gray-300 w-2/3 mb-2"></div>
        <div class="animate-pulse h-4 bg-gray-300 w-1/3"></div>
      </div>
      <div v-else-if="cartStore.items.length > 0" v-for="item in cartStore.items" :key="item.id">
        <div class="flex gap-2 justify-between items-end p-2 rounded-lg">
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <!-- Use @click to toggle selection instead of v-model -->
              <input type="checkbox" :checked="item.isSelected" @click="cartStore.toggleItemSelection(item.id)">
              <img
                v-lazy="item.image != null ? item.image : 'https://storage.googleapis.com/a1aa/image/xkZ4b5-ggWWw2S9PTnL8XdnGUhYKRjLiDBpDfRwv6rM.jpg'"
                :alt="item.name" class="w-24 h-24 rounded-lg object-cover" />
            </div>
            <div class="flex justify-between flex-col gap-2">
              <h2 class="text-md font-semibold capitalize line-clamp-2 max-w-46">
                {{ item.name }}
              </h2>
              <div v-if="item.salesCount"
                class="bg-yellow-400 shadow w-fit text-white text-xs font-bold px-4 py-1 rounded-full">
                Terjual {{ numberFormatter(item.salesCount) }}
              </div>
              <h2 class="text-sm capitalize text-red-400 font-semibold mb-2 truncate">
                {{ formatMoney(item.price) }}
              </h2>

            </div>
          </div>
          <!-- <div class="flex items-center gap-2">
            <div>{{ formatMoney(item.price * item.qty) }}</div>
            <button type="button" @click="cartStore.removeItem(item.id)" class="text-red-500 text-sm">
              <Icon icon="mdi:delete" class="text-red-500"></Icon>
            </button>
          </div> -->
          <div class="flex items-center bg-gray-100 rounded w-fit mb-2">
            <button type="button" @click="updateQuantity(item, item.qty - 1)" class="px-2 py-1">-</button>
            <p class="text-sm w-12 text-center">{{ item.qty }}</p>
            <button type="button" @click="updateQuantity(item, item.qty + 1)" class="px-2 py-1">+</button>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-40">
        <Vue3Lottie :animationData="notFound" :loop="true" :autoplay="true" style="width: 200px; height: 200px;" />
        <p class="text-sm mt-4">Sepertinya keranjang kamu kosong</p>
      </div>
    </form>

    <div class="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-gray-300 p-4 z-40">
      <div class="flex font-bold justify-between mb-2">
        <span>Total:</span>
        <span>{{ formatMoney(cartStore.selectedTotal) }}</span>
      </div>
      <button :disabled="isLoading || cartStore.selectedItems.length === 0" @click="handleCheckout"
        class="w-full p-4 text-sm bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400 text-white text-center rounded-lg">
        Pesan Sekarang ( {{ cartStore.selectedItemCount }} )
      </button>
    </div>
  </div>
</template>

<style scoped>
:deep(.swiper-pagination-bullet) {
  background-color: #FFD700 !important;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #FFA500 !important;
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