<template>
  <div class="overflow-y-auto overscroll-contain h-screen w-full flex flex-col gap-4" ref="scrollContainer">
    <!-- Header -->

    <div class="p-4 flex w-full max-w-[480px] items-center"
      :class="{ 'bg-white shadow-xl fixed z-50 top-0': isScrolled, 'bg-transparent': !isScrolled }">
      <button @click="router.back() ?? router.push('/')" class="p-3 rounded-full px-4">
        <Icon icon="weui:back-filled" class="text-black" />
      </button>
      <h2 class="text-lg font-bold">Profil Saya</h2>
    </div>

    <!-- Form -->
    <form class="px-4 w-full max-w-[480px] mx-auto grid grid-cols-1 gap-4" @submit.prevent="onSubmit">
      <div>
        <label class="font-semibold block">Nama <span class="text-red-500">*</span></label>
        <input v-model="form.name" type="text"
          class="mt-1 w-full rounded-lg py-3 px-2 bg-gray-100 border-0 focus:ring focus:ring-blue-500 focus:border-blue-500" />
        <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</p>
      </div>

      <div>
        <label class="font-semibold block">Email</label>
        <input v-model="form.email" type="email"
          class="mt-1 w-full rounded-lg py-3 px-2 bg-gray-100 border-0 focus:ring focus:ring-blue-500 focus:border-blue-500" />
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
      </div>

      <div>
        <label class="font-semibold block">No. Telepon <span class="text-red-500">*</span></label>
        <input v-model="form.phone" type="text"
          class="mt-1 w-full rounded-lg py-3 px-2 bg-gray-100 border-0 focus:ring focus:ring-blue-500 focus:border-blue-500" />
        <p v-if="errors.phone" class="text-red-500 text-sm">{{ errors.phone }}</p>
      </div>

      <div>
        <label class="font-semibold block">Alamat</label>
        <div v-for="(addr, index) in form.addresses" :key="index" class="flex gap-2 items-center justify-center">
          <input type="radio" :checked="addr.isSelected" name="selectedAddress" @change="selectAddress(index)"
            class="mt-2" />
          <textarea v-model="addr.value" type="text"
            class="input flex-1 mt-1 w-full rounded-lg py-3 px-2 bg-gray-100 border-0 focus:ring focus:ring-blue-500 focus:border-blue-500" />
          <button type="button" @click="removeAddress(index)" class="text-red-500 text-xs mt-2">
            <Icon icon="simple-line-icons:minus" />
          </button>
        </div>
        <button type="button" @click="addAddress" class="mt-2 text-blue-500 text-sm"
          :disabled="form.addresses.length >= 5">+ Tambah Alamat</button>
        <p v-if="errors.addresses" class="text-red-500 text-sm">{{ errors.addresses }}</p>
      </div>

      <button type="submit"
        class="mt-4 bg-red-500 text-white text-sm p-4 rounded-lg disabled:bg-red-400 disabled:cursor-not-allowed">
        Simpan Profil
      </button>
    </form>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { ref, reactive, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import * as yup from 'yup';
import { useRouter } from 'vue-router';

const router = useRouter();
const scrollContainer = ref(null);
const isScrolled = ref(false);

const store = useProfileStore();
const errors = reactive({});

const form = reactive({
  name: store.profile.name || '',
  email: store.profile.email || '',
  phone: store.profile.phone || '',
  addresses: store.profile.addresses.length > 0
    ? store.profile.addresses.map(a => ({ value: a.value, isSelected: a.isSelected }))
    : [{ value: '', isSelected: true }]
});

const schema = yup.object({
  name: yup.string().required('Nama wajib diisi'),
  email: yup.string().email('Format email tidak valid').notRequired(),
  phone: yup.string().required('Nomor telepon wajib diisi'),
  addresses: yup.array()
    .max(5, 'Maksimal 5 alamat')
    .of(yup.object({
      value: yup.string().required('Alamat wajib diisi'),
      isSelected: yup.boolean()
    }))
});

const onSubmit = async () => {
  try {
    await schema.validate(form, { abortEarly: false });
    await store.updateProfile(form);
    alert('Profil berhasil disimpan!');
    Object.keys(errors).forEach(key => delete errors[key]);
  } catch (err) {
    if (err.inner) {
      err.inner.forEach(e => errors[e.path] = e.message);
    }
  }
};

const addAddress = () => {
  if (form.addresses.length < 5) {
    form.addresses.push({ value: '', isSelected: false });
  }
};

const removeAddress = (index) => {
  const wasSelected = form.addresses[index].isSelected;
  form.addresses.splice(index, 1);
  if (wasSelected && form.addresses.length > 0) {
    form.addresses[0].isSelected = true;
  }
};

const selectAddress = (index) => {
  form.addresses.forEach((a, i) => a.isSelected = i === index);
};

onMounted(() => {
  scrollContainer.value?.addEventListener('scroll', () => {
    isScrolled.value = scrollContainer.value.scrollTop > 20;
  });
});
</script>