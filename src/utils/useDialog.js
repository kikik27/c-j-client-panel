// useDialog.js
import { ref, reactive, markRaw, h, render } from 'vue';

const dialogs = reactive([]);

// Create a unique ID for each dialog
let dialogCounter = 0;

export function useDialog() {
  // Function to open a dialog with options
  const open = (options = {}) => {
    const dialogId = `dialog-${dialogCounter++}`;

    return new Promise((resolve) => {
      // Default options
      const dialogOptions = {
        id: dialogId,
        title: options.title || '',
        description: options.description || '',
        content: options.content || null,
        confirmButtonText: options.confirmButtonText || 'Confirm',
        cancelButtonText: options.cancelButtonText || 'Cancel',
        showCancelButton: options.showCancelButton !== false,
        showConfirmButton: options.showConfirmButton !== false,
        persistent: options.persistent || false,
        confirmButtonClass: options.confirmButtonClass || '',
        panelClass: options.panelClass || '',
        onConfirm: () => {
          closeDialog(dialogId);
          resolve(true);
          if (options.onConfirm) options.onConfirm();
        },
        onCancel: () => {
          closeDialog(dialogId);
          resolve(false);
          if (options.onCancel) options.onCancel();
        },
        isOpen: true
      };

      dialogs.push(dialogOptions);
    });
  };

  // Function to close a specific dialog by ID
  const closeDialog = (id) => {
    const index = dialogs.findIndex(dialog => dialog.id === id);
    if (index !== -1) {
      dialogs.splice(index, 1);
    }
  };

  // Function to close all dialogs
  const closeAll = () => {
    dialogs.splice(0, dialogs.length);
  };

  // Convenience methods for common dialog types
  const confirm = (options = {}) => {
    return open({
      title: options.title || 'Confirmation',
      description: options.description || 'Are you sure you want to proceed?',
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || 'No',
      ...options
    });
  };

  const alert = (options = {}) => {
    if (typeof options === 'string') {
      options = { description: options };
    }

    return open({
      title: options.title || 'Alert',
      showCancelButton: false,
      confirmButtonText: options.confirmButtonText || 'OK',
      ...options
    });
  };

  const prompt = (options = {}) => {
    const inputValue = ref('');

    const content = {
      setup() {
        return () => h('input', {
          type: 'text',
          value: inputValue.value,
          class: 'mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50',
          placeholder: options.placeholder || '',
          onInput: (e) => {
            inputValue.value = e.target.value;
          }
        });
      }
    };

    return new Promise((resolve) => {
      open({
        title: options.title || 'Input',
        description: options.description || 'Please enter a value:',
        content: markRaw(content),
        onConfirm: () => {
          resolve(inputValue.value);
        },
        onCancel: () => {
          resolve(null);
        },
        ...options
      });
    });
  };

  return {
    open,
    closeDialog,
    closeAll,
    confirm,
    alert,
    prompt,
    dialogs
  };
}

// Create a single instance for global use
export const globalDialog = useDialog();