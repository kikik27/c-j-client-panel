import * as yup from 'yup';
import { ref, reactive, markRaw, h, render } from 'vue';
import error from '@/assets/lottie-warning.json'
import success from '@/assets/lottie-success.json'
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
        animation: options.animation || success,
        isOpen: true
      };

      if (options.duration) {
        setTimeout(() => {
          closeDialog(dialogId);
          resolve(); // resolve tanpa true/false
        }, options.duration);
      }

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
      options = { description: options, animation: success };
    }

    return open({
      title: options.title || 'Alert',
      showCancelButton: false,
      confirmButtonText: options.confirmButtonText || 'OK',
      ...options
    });
  };

  const prompt = (options = {}) => {
    const fields = options.fields || [];
    const formData = reactive({});
    const errors = reactive({});

    fields.forEach(field => {
      formData[field.name] = '';
      errors[field.name] = '';
    });

    const schema = yup.object().shape(
      Object.fromEntries(fields.map(field => [
        field.name,
        field.rule || yup.string().required(`${field.label} wajib diisi`)
      ]))
    );

    // PromptForm.vue atau bisa juga inline komponen
    const PromptForm = defineComponent({
      props: ['fields', 'formData', 'errors'],
      setup(props) {
        return () =>
          h('div', {}, props.fields.map(field => [
            h('label', { class: 'block mt-2 font-semibold' }, field.label),
            h('input', {
              type: field.type || 'text',
              value: props.formData[field.name],
              placeholder: field.placeholder || '',
              class: 'mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1',
              onInput: e => {
                props.formData[field.name] = e.target.value;
                props.errors[field.name] = '';
              }
            }),
            props.errors[field.name]
              ? h('p', { class: 'text-red-500 text-sm' }, props.errors[field.name])
              : null
          ]));
      }
    });


    const contentComponent = h(PromptForm, { fields, formData, errors });

    return new Promise((resolve) => {
      open({
        title: options.title || 'Form',
        description: options.description || '',
        content: markRaw(contentComponent),
        confirmButtonText: 'Kirim',
        cancelButtonText: 'Batal',
        animation: options.animation,
        onConfirm: async () => {
          try {
            const data = await schema.validate(formData, { abortEarly: false });
            resolve(data);
          } catch (err) {
            if (err.inner) {
              err.inner.forEach(e => {
                errors[e.path] = e.message;
              });
            }
          }
        },
        onCancel: () => resolve(null)
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