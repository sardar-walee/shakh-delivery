export type AddressTag = 'home' | 'work' | 'office' | 'other';

export interface DeliveryAddress {
  id: string;
  user_id?: string;
  title: string;
  tag: AddressTag;
  city: string;
  district?: string;
  sub_district?: string;
  street_address: string;
  building_name?: string;
  floor_apartment?: string;
  nearest_landmark?: string;
  latitude: number;
  longitude: number;
  phone_contact?: string;
  driver_instructions?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationGeoResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  addressName?: string;
  city?: string;
  district?: string;
  country?: string;
}
