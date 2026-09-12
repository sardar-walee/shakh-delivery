import { create } from 'zustand';
import { ToastItem, ToastOptions, ToastPosition, ToastCartDetails } from '../types/toast';

interface ToastState {
  toasts: ToastItem[];
  position: ToastPosition;
  setPosition: (pos: ToastPosition) => void;
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  clearAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  position: 'bottom-right',

  setPosition: (position: ToastPosition) => set({ position }),

  show: (options: ToastOptions) => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      ...options,
      id,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 4000,
      createdAt: Date.now(),
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
    };

    set((state) => {
      // Remove any existing toast with the same ID if replaced, and keep max 5 toasts visible to avoid clutter
      const filtered = state.toasts.filter((t) => t.id !== id);
      const capped = [...filtered, newToast].slice(-5);
      return { toasts: capped };
    });

    return id;
  },

  dismiss: (id: string) => {
    const toast = get().toasts.find((t) => t.id === id);
    if (toast?.onDismiss) {
      toast.onDismiss();
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  update: (id: string, updatedOptions: Partial<ToastOptions>) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...updatedOptions } : t)),
    }));
  },
}));

/**
 * Global imperative helper for triggering toast notifications anywhere in the app
 * without requiring React component hooks.
 */
export const toast = {
  show: (options: ToastOptions) => useToastStore.getState().show(options),

  success: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().show({
      ...options,
      message,
      type: 'success',
      duration: options?.duration ?? 3500,
    }),

  error: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().show({
      ...options,
      message,
      type: 'error',
      duration: options?.duration ?? 5000,
    }),

  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().show({
      ...options,
      message,
      type: 'warning',
      duration: options?.duration ?? 4500,
    }),

  info: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().show({
      ...options,
      message,
      type: 'info',
      duration: options?.duration ?? 3500,
    }),

  /**
   * Specialized Rich Cart Toast notification displaying product image, price, quantity,
   * and quick Action button (e.g. View Cart / Orders).
   */
  cart: (
    cartItem: ToastCartDetails,
    options?: {
      title?: string;
      message?: string;
      action?: { label: string; onClick: () => void };
      duration?: number;
    }
  ) => {
    const formattedPrice = cartItem.price ? `${cartItem.price.toLocaleString()} IQD` : '';
    const fallbackMessage = cartItem.quantity && cartItem.quantity > 1
      ? `${cartItem.quantity}x ${cartItem.name} ${formattedPrice ? `(${formattedPrice})` : ''}`
      : `${cartItem.name} ${formattedPrice ? `• ${formattedPrice}` : ''}`;

    return useToastStore.getState().show({
      title: options?.title || 'Added to Cart',
      message: options?.message || fallbackMessage,
      type: 'cart',
      cartDetails: cartItem,
      duration: options?.duration ?? 4500,
      action: options?.action,
    });
  },

  loading: (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) =>
    useToastStore.getState().show({
      ...options,
      message,
      type: 'loading',
      duration: 0, // Persistent until manually dismissed or updated
    }),

  dismiss: (id: string) => useToastStore.getState().dismiss(id),

  clearAll: () => useToastStore.getState().clearAll(),

  /**
   * Helper to wrap an async promise with automatic loading, success, and error toasts.
   */
  promise: async <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: Omit<ToastOptions, 'message' | 'type'>
  ): Promise<T> => {
    const toastId = toast.loading(msgs.loading, options);
    try {
      const data = await promise;
      const successMsg = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
      useToastStore.getState().update(toastId, {
        message: successMsg,
        type: 'success',
        duration: options?.duration ?? 3500,
      });
      return data;
    } catch (err: any) {
      const errorMsg = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
      useToastStore.getState().update(toastId, {
        message: errorMsg,
        type: 'error',
        duration: options?.duration ?? 5000,
      });
      throw err;
    }
  },
};
