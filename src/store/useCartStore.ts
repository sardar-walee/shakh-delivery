import { create } from 'zustand';
import { CartItem, CartStore } from '../types/cart';
import { toast } from './useToastStore';

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (item, quantity = 1, showToastFeedback = true) => {
    let previousItem: CartItem | undefined;

    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.id === item.id);
      let newItems: CartItem[];

      if (existingIndex >= 0) {
        previousItem = state.items[existingIndex];
        newItems = state.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity }];
      }
      return { items: newItems };
    });

    if (showToastFeedback) {
      const currentItem = get().items.find((i) => i.id === item.id);
      const totalQty = currentItem?.quantity || quantity;

      toast.cart(
        {
          id: item.id,
          name: item.name,
          name_ku: item.name_ku,
          name_ar: item.name_ar,
          price: item.price,
          quantity: totalQty,
          image: item.image,
          storeName: item.storeName,
        },
        {
          title: 'سەبەتەی کڕین نوێکرایەوە / Cart Updated',
          message: `${totalQty}x ${item.name} (${(item.price * totalQty).toLocaleString()} IQD)`,
          action: {
            label: 'سەبەتە / View Cart',
            onClick: () => get().openCart(),
          },
        }
      );
    }
  },

  removeItem: (id, showToastFeedback = true) => {
    const itemToRemove = get().items.find((i) => i.id === id);

    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      return { items: newItems };
    });

    if (showToastFeedback && itemToRemove) {
      toast.info(
        `کاڵای "${itemToRemove.name}" لە سەبەتەی کڕین سڕایەوە / Item removed from cart`,
        {
          action: {
            label: 'گەڕاندنەوە / Undo',
            onClick: () => {
              get().addItem(itemToRemove, itemToRemove.quantity, false);
              toast.success(`"${itemToRemove.name}" گەڕێندرایەوە / Restored to cart`);
            },
          },
        }
      );
    }
  },

  updateQuantity: (id, delta) => {
    set((state) => {
      const newItems = state.items
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      return { items: newItems };
    });
  },

  setQuantity: (id, quantity) => {
    set((state) => {
      const newItems =
        quantity <= 0
          ? state.items.filter((i) => i.id !== id)
          : state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
      return { items: newItems };
    });
  },

  clearCart: (showToastFeedback = true) => {
    const previousItems = get().items;
    set({ items: [] });

    if (showToastFeedback && previousItems.length > 0) {
      toast.info('سەبەتەی کڕین بەتاڵ کرایەوە / Cart cleared', {
        action: {
          label: 'گەڕاندنەوە / Undo',
          onClick: () => {
            set({ items: previousItems });
            toast.success('سەبەتەی کڕین گەڕێندرایەوە / Cart restored');
          },
        },
      });
    }
  },

  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
