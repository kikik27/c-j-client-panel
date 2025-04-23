import { defineStore } from 'pinia';
import { ref } from 'vue';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import * as yup from 'yup';

const SECRET_KEY = import.meta.env.VITE_APP_KEY;

export const useProfileStore = defineStore('profile', () => {
  const profile = ref({
    name: '',
    email: '',
    phone: '',
    addresses: [] // [{ value: 'Jl. Sudirman...', isSelected: true }]
  });

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  };

  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting profile data:', error);
      return null;
    }
  };

  const loadProfile = () => {
    try {
      const encryptedProfile = Cookies.get('profile');
      if (encryptedProfile) {
        const decrypted = decryptData(encryptedProfile);
        profile.value = {
          name: decrypted.name || '',
          email: decrypted.email || '',
          phone: decrypted.phone || '',
          addresses: Array.isArray(decrypted.addresses)
            ? decrypted.addresses.map(addr => ({
              value: addr.value || '',
              isSelected: addr.isSelected === true
            }))
            : []
        };
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      clearProfile();
    }
  };

  const saveProfile = () => {
    const encrypted = encryptData(profile.value);
    Cookies.set('profile', encrypted, { expires: 7 });
  };

  const updateProfile = async (newData) => {
    try {
      await validationSchema.validate(newData, { abortEarly: false });

      // Set only 1 selected address
      const normalizedAddresses = (newData.addresses || []).map((addr, idx) => ({
        value: addr.value,
        isSelected: idx === newData.addresses.findIndex(a => a.isSelected)
      }));

      profile.value = {
        name: newData.name,
        email: newData.email || '',
        phone: newData.phone,
        addresses: normalizedAddresses.slice(0, 5)
      };

      saveProfile();
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  };

  const setSelectedAddress = (index) => {
    profile.value.addresses = profile.value.addresses.map((addr, i) => ({
      ...addr,
      isSelected: i === index
    }));
    saveProfile();
  };

  const clearProfile = () => {
    profile.value = {
      name: '',
      email: '',
      phone: '',
      addresses: []
    };
    Cookies.remove('profile');
  };

  // Yup schema
  const validationSchema = yup.object().shape({
    name: yup.string().required('Nama wajib diisi'),
    email: yup.string().email('Email tidak valid').notRequired(),
    phone: yup.string().required('No. Telepon wajib diisi'),
    addresses: yup.array()
      .max(5, 'Maksimal 5 alamat')
      .of(
        yup.object({
          value: yup.string().required('Alamat wajib diisi'),
          isSelected: yup.boolean()
        })
      ).notRequired(),
  });

  loadProfile();

  return {
    profile,
    loadProfile,
    saveProfile,
    updateProfile,
    setSelectedAddress,
    clearProfile
  };
});
