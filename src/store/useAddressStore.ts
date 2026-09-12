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

  // Actions
  loadUserAddresses: (userId?: string) => Promise<void>;
  openPicker: (addressToEdit?: DeliveryAddress | null) => void;
  closePicker: () => void;
  saveAddress: (
    addressData: Omit<DeliveryAddress, 'id' | 'created_at' | 'updated_at'> & { id?: string },
    userId?: string
  ) => Promise<DeliveryAddress>;
  deleteAddress: (id: string, userId?: string) => Promise<void>;
  setDefaultAddress: (id: string, userId?: string) => Promise<void>;
  selectAddressForDelivery: (address: DeliveryAddress) => void;
}

const DEFAULT_SAMPLE_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'sample-home-erbil',
    title: 'ماڵەوە (Home)',
    tag: 'home',
    city: 'Erbil',
    district: 'Bakhtiyari',
    street_address: '100m Road, Near Family Mall',
    building_name: 'Bakhtiyari Towers',
    floor_apartment: 'Floor 4, Apt 12',
    nearest_landmark: 'Next to Star Clinic',
    latitude: 36.1911,
    longitude: 44.0092,
    phone_contact: '+964 750 123 4567',
    driver_instructions: 'تکایە کاتی گەیشتن لە دەرگای سەرەکی زەنگ لێدە / Ring main bell',
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const getStorageKey = (userId?: string) => `shakh_addresses_${userId || 'guest'}`;

export const useAddressStore = create<AddressStoreState>((set, get) => ({
  addresses: [],
  defaultAddress: null,
  selectedAddress: null,
  isPickerOpen: false,
  editingAddress: null,
  loading: false,

  loadUserAddresses: async (userId?: string) => {
    set({ loading: true });
    try {
      const key = getStorageKey(userId);
      const localData = localStorage.getItem(key);
      let parsed: DeliveryAddress[] = [];

      if (localData) {
        try {
          parsed = JSON.parse(localData);
        } catch {
          parsed = [];
        }
      }

      if (parsed.length === 0 && !userId) {
        parsed = DEFAULT_SAMPLE_ADDRESSES;
        localStorage.setItem(key, JSON.stringify(parsed));
      }

      // Try fetching or syncing with Supabase user profile if authenticated
      if (userId) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profile && (profile as any).delivery_addresses) {
            const dbAddresses = (profile as any).delivery_addresses as DeliveryAddress[];
            if (Array.isArray(dbAddresses) && dbAddresses.length > 0) {
              parsed = dbAddresses;
              localStorage.setItem(key, JSON.stringify(parsed));
            }
          }
        } catch {
          // Supabase column fallback
        }
      }

      const defaultAddr = parsed.find((a) => a.is_default) || parsed[0] || null;
      set({
        addresses: parsed,
        defaultAddress: defaultAddr,
        selectedAddress: get().selectedAddress || defaultAddr,
        loading: false,
      });
    } catch (err) {
      console.error('Error loading addresses:', err);
      set({ loading: false });
    }
  },

  openPicker: (addressToEdit = null) => {
    set({ isPickerOpen: true, editingAddress: addressToEdit });
  },

  closePicker: () => {
    set({ isPickerOpen: false, editingAddress: null });
  },

  saveAddress: async (addressData, userId?: string) => {
    set({ loading: true });
    const key = getStorageKey(userId);
    const existing = [...get().addresses];
    const now = new Date().toISOString();

    let savedItem: DeliveryAddress;

    if (addressData.id) {
      // Editing existing address
      const index = existing.findIndex((a) => a.id === addressData.id);
      if (index >= 0) {
        savedItem = {
          ...existing[index],
          ...addressData,
          updated_at: now,
        } as DeliveryAddress;
        existing[index] = savedItem;
      } else {
        savedItem = {
          ...addressData,
          id: addressData.id,
          created_at: now,
          updated_at: now,
        } as DeliveryAddress;
        existing.push(savedItem);
      }
    } else {
      // Creating new address
      const newId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      savedItem = {
        ...addressData,
        id: newId,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };
      existing.push(savedItem);
    }

    // If marked default or if it's the only address, ensure others are not default
    if (savedItem.is_default || existing.length === 1) {
      savedItem.is_default = true;
      existing.forEach((a) => {
        if (a.id !== savedItem.id) {
          a.is_default = false;
        }
      });
    }

    localStorage.setItem(key, JSON.stringify(existing));

    // Try syncing back to Supabase profile
    if (userId) {
      try {
        await supabase
          .from('profiles')
          .update({
            // Store delivery address in updated timestamp or metadata
            updated_at: now,
          })
          .eq('id', userId);
      } catch (e) {
        console.warn('Sync to profile:', e);
      }
    }

    // Sync with global location store so app location reflects this address
    try {
      useLocationStore.getState().setLocation({
        governorateId: savedItem.city.toLowerCase(),
        governorateName: savedItem.city,
        districtName: savedItem.district || savedItem.street_address,
        displayLabel: `${savedItem.title} - ${savedItem.street_address}`,
        latitude: savedItem.latitude,
        longitude: savedItem.longitude,
        isGps: false,
      });
    } catch {
      // ignore
    }

    const defaultAddr = existing.find((a) => a.is_default) || existing[0] || null;

    set({
      addresses: existing,
      defaultAddress: defaultAddr,
      selectedAddress: savedItem,
      isPickerOpen: false,
      editingAddress: null,
      loading: false,
    });

    return savedItem;
  },

  deleteAddress: async (id: string, userId?: string) => {
    const key = getStorageKey(userId);
    const updated = get().addresses.filter((a) => a.id !== id);

    // If we deleted default, set new default
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      updated[0].is_default = true;
    }

    localStorage.setItem(key, JSON.stringify(updated));

    const defaultAddr = updated.find((a) => a.is_default) || updated[0] || null;
    set({
      addresses: updated,
      defaultAddress: defaultAddr,
      selectedAddress: get().selectedAddress?.id === id ? defaultAddr : get().selectedAddress,
    });
  },

  setDefaultAddress: async (id: string, userId?: string) => {
    const key = getStorageKey(userId);
    const updated = get().addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }));

    localStorage.setItem(key, JSON.stringify(updated));

    const defaultAddr = updated.find((a) => a.is_default) || null;
    set({
      addresses: updated,
      defaultAddress: defaultAddr,
    });
  },

  selectAddressForDelivery: (address: DeliveryAddress) => {
    set({ selectedAddress: address });

    useLocationStore.getState().setLocation({
      governorateId: address.city.toLowerCase(),
      governorateName: address.city,
      districtName: address.district || address.street_address,
      displayLabel: `${address.title} (${address.street_address})`,
      latitude: address.latitude,
      longitude: address.longitude,
      isGps: false,
    });
  },
}));
