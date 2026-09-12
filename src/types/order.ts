export type OrderStatus =
  | 'NEW'
  | 'PENDING'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'CAPTAIN_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id?: string;
  name: string;
  name_ku?: string;
  name_ar?: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

export interface OrderAddress {
  label?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  street?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface CaptainInfo {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  vehicleType?: 'motorcycle' | 'car' | 'bicycle';
  vehiclePlate?: string;
  rating?: number;
  totalDeliveries?: number;
  currentLat?: number;
  currentLng?: number;
}

export interface BusinessInfo {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface TrackedOrder {
  id: string;
  order_number: string;
  customer_id: string;
  business_id: string;
  captain_id?: string | null;
  status: OrderStatus;
  payment_status: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  platform_fee: number;
  total: number;
  commission?: number;
  address?: OrderAddress | any;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  estimated_delivery_minutes?: number;
  items?: OrderItem[];
  captain?: CaptainInfo | null;
  business?: BusinessInfo | null;
  is_scheduled?: boolean;
  scheduled_date?: string;
  scheduled_time?: string;
  scheduled_slot_label?: string;
  category?: 'food' | 'market';
}

export type ScheduledOrderCategory = 'food' | 'market';

export interface ScheduledOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  business_id: string;
  business_name: string;
  captain_id: string;
  category: ScheduledOrderCategory;
  category_label_ku: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: 'CASH_ON_DELIVERY' | 'FIB' | 'FASTPAY' | 'ZAIN_CASH';
  subtotal: number;
  delivery_fee: number;
  platform_fee: number;
  captain_fee: number;
  discount: number;
  total: number;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  scheduled_slot_label: string; // e.g. "13:30 - 14:00 (نیوەڕۆ / Lunch)"
  address: OrderAddress;
  notes?: string | null;
  items: OrderItem[];
  captain: CaptainInfo;
  created_at: string;
  captain_notified: boolean;
  captain_notified_at: string;
  captain_acknowledged?: boolean;
}

export interface CaptainNotificationAlert {
  id: string;
  captain_id: string;
  order_id: string;
  order_number: string;
  category: ScheduledOrderCategory;
  title: string;
  title_ku: string;
  message: string;
  message_ku: string;
  scheduled_date: string;
  scheduled_time: string;
  customer_name: string;
  customer_phone: string;
  store_name: string;
  delivery_address: string;
  total_amount: number;
  captain_earnings: number;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'normal';
}

