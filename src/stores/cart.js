import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_APP_KEY;

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([]);
  const isLoading = ref(false);

  // Getters
  const cartCount = computed(() => {
    return items.value.reduce((total, item) => total + item.qty, 0);
  });

  const cartTotal = computed(() => {
    return items.value.reduce((total, item) => total + item.price * item.qty, 0);
  });

  const selectedItems = computed(() => {
    return items.value.filter(item => item.isSelected);
  });

  const selectedTotal = computed(() => {
    return selectedItems.value.reduce((total, item) => total + item.price * item.qty, 0);
  });

  // Enkripsi data sebelum disimpan ke cookies
  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  };

  // Dekripsi data saat membaca dari cookies
  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting cart data:', error);
      return [];
    }
  };

  // Load cart data from cookies
  const loadCart = () => {
    try {
      const encryptedCart = Cookies.get('cart');
      if (encryptedCart) {
        const decryptedCart = decryptData(encryptedCart);
        items.value = decryptedCart.map(item => ({
          ...item,
          isSelected: item.isSelected !== undefined ? item.isSelected : true, // Default selected
        }));
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      items.value = [];
      saveCart(); // Reset the cart cookie
    }
  };

  // Save cart data to cookies with encryption
  const saveCart = () => {
    const encryptedCart = encryptData(items.value);
    Cookies.set('cart', encryptedCart, { expires: 7 });
  };

  const addToCart = (product) => {
    const existingItem = items.value.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.qty++;
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.catalog_images[0].image,
        qty: 1,
        isSelected: true,
      });
    }

    saveCart();
  };

  const updateItemQuantity = (itemId, quantity) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      item.qty = Math.max(1, quantity); // Ensure minimum quantity is 1
      saveCart();
    }
  };

  const toggleItemSelection = (itemId) => {
    const item = items.value.find(item => item.id === itemId);
    if (item) {
      item.isSelected = !item.isSelected;
      saveCart();
    }
  };

  const removeItem = (itemId) => {
    items.value = items.value.filter(item => item.id !== itemId);
    saveCart();
  };

  const clearCart = () => {
    items.value = [];
    saveCart();
  };

  // Initialize cart on store creation
  loadCart();

  return {
    items,
    isLoading,
    cartCount,
    cartTotal,
    selectedItems,
    selectedTotal,
    loadCart,
    addToCart,
    updateItemQuantity,
    toggleItemSelection,
    removeItem,
    clearCart,
  };
});
