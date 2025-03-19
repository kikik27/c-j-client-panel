// plugins/dialog.js
import { markRaw, createVNode, render } from 'vue';
import GlobalDialog from '@/components/dialog.vue';
import { globalDialog } from '@/utils/useDialog';

export const DialogPlugin = {
  install: (app) => {
    // Add globalDialog to app's global properties
    app.config.globalProperties.$dialog = globalDialog;

    // Add a component for rendering dialogs globally
    app.component('DialogContainer', {
      setup() {
        return () => globalDialog.dialogs.map(dialog => {
          return createVNode(GlobalDialog, {
            key: dialog.id,
            modelValue: dialog.isOpen,
            'onUpdate:modelValue': (value) => {
              if (!value && !dialog.persistent) {
                dialog.onCancel();
              }
            },
            title: dialog.title,
            description: dialog.description,
            confirmButtonText: dialog.confirmButtonText,
            cancelButtonText: dialog.cancelButtonText,
            showCancelButton: dialog.showCancelButton,
            showConfirmButton: dialog.showConfirmButton,
            confirmButtonClass: dialog.confirmButtonClass,
            panelClass: dialog.panelClass,
            persistent: dialog.persistent,
            onConfirm: dialog.onConfirm,
            onCancel: dialog.onCancel
          }, dialog.content ? { default: () => createVNode(dialog.content) } : {});
        });
      }
    });

    // Provide composable for Options API and Composition API
    app.provide('dialog', globalDialog);
  }
};

// Export the composable for direct use in composition API
export { useDialog } from '@/utils/useDialog';