import { create } from 'zustand';
import { TrackedProduct } from '../types/priceTrend';
import { TRACKED_PRODUCTS } from '../data/trackedProducts';

interface ProductState {
  products: TrackedProduct[];
  activeProduct: TrackedProduct | null;
  isOpen: boolean;

  // Actions
  openProductModal: (productOrId: TrackedProduct | string) => void;
  closeProductModal: () => void;
  getProductById: (id: string) => TrackedProduct | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: TRACKED_PRODUCTS,
  activeProduct: null,
  isOpen: false,

  openProductModal: (productOrId) => {
    if (typeof productOrId === 'string') {
      const found = get().products.find((p) => p.id === productOrId);
      if (found) {
        set({ activeProduct: found, isOpen: true });
      }
    } else {
      set({ activeProduct: productOrId, isOpen: true });
    }
  },

  closeProductModal: () => {
    set({ isOpen: false, activeProduct: null });
  },

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },
}));
