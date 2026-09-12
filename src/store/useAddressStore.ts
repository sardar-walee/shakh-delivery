import { create } from 'zustand';
import { DeliveryAddress } from '../types/address.types';
import { supabase } from '../lib/supabase';
import { useLocationStore } from './useLocationStore';
import { isValidUUID } from '../utils/uuid';

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

      // Fetch from Supabase delivery_addresses table if authenticated
      if (userId && isValidUUID(userId)) {
        try {
          const { data: dbAddresses, error } = await supabase
            .from('delivery_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

          if (!error && dbAddresses && dbAddresses.length > 0) {
            parsed = dbAddresses as DeliveryAddress[];
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch {
          // Supabase table fallback
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

    // Direct persistence to Supabase delivery_addresses table
    if (userId && isValidUUID(userId)) {
      try {
        const payload: any = {
          user_id: userId,
          title: savedItem.title,
          tag: savedItem.tag || 'home',
          city: savedItem.city,
          district: savedItem.district || null,
          sub_district: savedItem.sub_district || null,
          street_address: savedItem.street_address,
          building_name: savedItem.building_name || null,
          floor_apartment: savedItem.floor_apartment || null,
          nearest_landmark: savedItem.nearest_landmark || null,
          latitude: savedItem.latitude,
          longitude: savedItem.longitude,
          phone_contact: savedItem.phone_contact || null,
          driver_instructions: savedItem.driver_instructions || null,
          is_default: savedItem.is_default,
          updated_at: now,
        };

        if (savedItem.id && isValidUUID(savedItem.id)) {
          payload.id = savedItem.id;
          await supabase.from('delivery_addresses').upsert(payload);
        } else {
          const { data: inserted } = await supabase.from('delivery_addresses').insert(payload).select().single();
          if (inserted) {
            savedItem.id = inserted.id;
          }
        }
      } catch (e) {
        console.warn('Sync to delivery_addresses table:', e);
      }
    }

    localStorage.setItem(key, JSON.stringify(existing));

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

    if (userId && isValidUUID(userId) && isValidUUID(id)) {
      try {
        await supabase.from('delivery_addresses').delete().eq('id', id).eq('user_id', userId);
      } catch (e) {
        console.warn('Delete from delivery_addresses:', e);
      }
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

    if (userId && isValidUUID(userId)) {
      try {
        await supabase.from('delivery_addresses').update({ is_default: false }).eq('user_id', userId);
        if (isValidUUID(id)) {
          await supabase.from('delivery_addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId);
        }
      } catch (e) {
        console.warn('Update default address:', e);
      }
    }

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
