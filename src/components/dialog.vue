<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeDialog">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/10 bg-opacity-50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all"
              :class="panelClass">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900" v-if="title">
                {{ title }}
              </DialogTitle>

              <div v-if="description" class="mt-2">
                <DialogDescription class="text-sm text-gray-500">
                  {{ description }}
                </DialogDescription>
              </div>

              <div class="mt-4">
                <!-- Custom content through default slot -->
                <slot></slot>
              </div>

              <div v-if="showFooter" class="mt-6 flex justify-end gap-3">
                <button v-if="showCancelButton" type="button"
                  class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  @click="onCancel">
                  {{ cancelButtonText }}
                </button>
                <button v-if="showConfirmButton" type="button" :class="confirmButtonClass" @click="onConfirm">
                  {{ confirmButtonText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  confirmButtonClass: {
    type: String,
    default: 'inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  },
  panelClass: {
    type: String,
    default: '',
  },
  // If true, clicking outside or pressing ESC won't close the dialog
  persistent: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const isOpen = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
});

function closeDialog() {
  if (!props.persistent) {
    emit('update:modelValue', false);
  }
}

function onConfirm() {
  emit('confirm');
  emit('update:modelValue', false);
}

function onCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>