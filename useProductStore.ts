import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { TrackedProduct } from '../types/priceTrend';

interface ProductState {
  products: TrackedProduct[];
  activeProduct: TrackedProduct | null;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  subscribeToRealtime: () => () => void;
  openProductModal: (productOrId: TrackedProduct | string) => void;
  closeProductModal: () => void;
  getProductById: (id: string) => TrackedProduct | undefined;
}

const mapProduct = (p: any): TrackedProduct => {
  const business = p.business || {};
  const metadata = p.metadata || {};
  const type = String(business.type || metadata.category || 'general').toLowerCase();
  const category = type === 'restaurant' ? 'food'
    : type === 'supermarket' ? 'supermarket'
    : ['car', 'cars'].includes(type) ? 'cars'
    : ['fashion', 'beauty', 'tech', 'umrah'].includes(type) ? type
    : 'general';

  const original = Number(metadata.original_price ?? p.price);
  const discount = Number(p.discount ?? 0);
  const current = Math.max(0, Number(p.price) - discount);
  const discountPercent = original > 0 ? Math.round(((original - current) / original) * 100) : 0;

  return {
    id: p.id,
    name: p.name,
    name_ku: metadata.name_ku,
    name_ar: metadata.name_ar,
    name_en: metadata.name_en,
    description: p.description || undefined,
    description_ku: metadata.description_ku,
    description_ar: metadata.description_ar,
    category: category as TrackedProduct['category'],
    price: current,
    original_price: original,
    discount_percent: discountPercent,
    image: p.images?.[0] || '',
    images: p.images || [],
    in_stock: Boolean(p.is_available && Number(p.stock) > 0),
    stock_count: Number(p.stock || 0),
    rating: Number(p.rating || 0),
    reviews_count: Number(p.reviews_count || 0),
    store_id: p.business_id,
    store_name: business.name || '',
    store_avatar: business.logo || undefined,
    store_location: business.address || undefined,
    store_verified: business.status === 'active',
    delivery_time_mins: Number(metadata.delivery_time_mins || 0) || undefined,
    delivery_fee: Number(metadata.delivery_fee || 0),
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    specs: Array.isArray(metadata.specs) ? metadata.specs : [],
  };
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  activeProduct: null,
  isOpen: false,
  loading: false,
  error: null,

  subscribeToRealtime: () => {
    const channel = supabase
      .channel('shakh-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        void get().loadProducts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        void get().loadProducts();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },

  loadProducts: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('products')
      .select('*, business:businesses!products_business_id_fkey(id,name,logo,address,type,status)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({ products: (data || []).map(mapProduct), loading: false });
  },

  openProductModal: (productOrId) => {
    const found = typeof productOrId === 'string'
      ? get().products.find((p) => p.id === productOrId)
      : productOrId;
    if (found) set({ activeProduct: found, isOpen: true });
  },

  closeProductModal: () => set({ isOpen: false, activeProduct: null }),

  getProductById: (id) => get().products.find((p) => p.id === id),
}));

export { mapProduct };
