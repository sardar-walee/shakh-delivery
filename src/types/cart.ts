export interface CartItem {
  id: string;
  name: string;
  name_ku?: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  original_price?: number;
  quantity: number;
  image: string;
  storeId?: string;
  storeName?: string;
  category?: string;
  notes?: string;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number, showToastFeedback?: boolean) => void;
  removeItem: (id: string, showToastFeedback?: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: (showToastFeedback?: boolean) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
}
