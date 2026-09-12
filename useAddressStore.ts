import { create } from 'zustand';
import { DeliveryAddress } from '../types/address.types';
import { supabase } from '../lib/supabase';
import { useLocationStore } from './useLocationStore';

interface AddressStoreState {
  addresses: DeliveryAddress[];
  defaultAddress: DeliveryAddress | null;
  selectedAddress: DeliveryAddress | null;
  isPickerOpen: boolean;
  editingAddress: DeliveryAddress | null;
  loading: boolean;
  loadUserAddresses: (userId?: string) => Promise<void>;
  openPicker: (addressToEdit?: DeliveryAddress | null) => void;
  closePicker: () => void;
  saveAddress: (addressData: Omit<DeliveryAddress, 'id' | 'created_at' | 'updated_at'> & { id?: string }, userId?: string) => Promise<DeliveryAddress>;
  deleteAddress: (id: string, userId?: string) => Promise<void>;
  setDefaultAddress: (id: string, userId?: string) => Promise<void>;
  selectAddressForDelivery: (address: DeliveryAddress) => void;
}

export const useAddressStore = create<AddressStoreState>((set, get) => ({
  addresses: [], defaultAddress: null, selectedAddress: null,
  isPickerOpen: false, editingAddress: null, loading: false,

  loadUserAddresses: async (userId) => {
    if (!userId) { set({ addresses: [], defaultAddress: null, loading: false }); return; }
    set({ loading: true });
    const { data, error } = await supabase.from('delivery_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
    const addresses = error ? [] : ((data || []) as DeliveryAddress[]);
    const defaultAddress = addresses.find(a => a.is_default) || addresses[0] || null;
    set({ addresses, defaultAddress, selectedAddress: get().selectedAddress || defaultAddress, loading: false });
  },

  openPicker: (addressToEdit = null) => set({ isPickerOpen: true, editingAddress: addressToEdit }),
  closePicker: () => set({ isPickerOpen: false, editingAddress: null }),

  saveAddress: async (addressData, userId) => {
    if (!userId) throw new Error('Authentication required');
    set({ loading: true });
    const payload: any = { ...addressData, user_id: userId, updated_at: new Date().toISOString() };
    delete payload.id;
    let data: any;
    let error: any;
    if (addressData.id) {
      ({ data, error } = await supabase.from('delivery_addresses').update(payload).eq('id', addressData.id).eq('user_id', userId).select().single());
    } else {
      ({ data, error } = await supabase.from('delivery_addresses').insert(payload).select().single());
    }
    if (error) { set({ loading: false }); throw error; }

    if (data.is_default) {
      await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId).neq('id', data.id);
    }
    await get().loadUserAddresses(userId);
    const saved = get().addresses.find(a => a.id === data.id) || data as DeliveryAddress;
    set({ selectedAddress: saved, isPickerOpen: false, editingAddress: null, loading: false });
    useLocationStore.getState().setLocation({
      governorateId: saved.city.toLowerCase(), governorateName: saved.city,
      districtName: saved.district || saved.street_address,
      displayLabel: `${saved.title} - ${saved.street_address}`,
      latitude: saved.latitude, longitude: saved.longitude, isGps: false,
    });
    return saved;
  },

  deleteAddress: async (id, userId) => {
    if (!userId) return;
    await supabase.from('delivery_addresses').delete().eq('id', id).eq('user_id', userId);
    await get().loadUserAddresses(userId);
  },

  setDefaultAddress: async (id, userId) => {
    if (!userId) return;
    await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('delivery_addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId);
    await get().loadUserAddresses(userId);
  },

  selectAddressForDelivery: (address) => {
    set({ selectedAddress: address });
    useLocationStore.getState().setLocation({
      governorateId: address.city.toLowerCase(), governorateName: address.city,
      districtName: address.district || address.street_address,
      displayLabel: `${address.title} (${address.street_address})`,
      latitude: address.latitude, longitude: address.longitude, isGps: false,
    });
  },
}));
