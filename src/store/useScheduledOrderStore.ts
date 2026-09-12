import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ScheduledOrder, CaptainNotificationAlert, OrderItem, OrderAddress, ScheduledOrderCategory } from '../types/order';
import { dispatchNotification } from '../lib/notifications';

interface CreateScheduledOrderParams {
  items: OrderItem[];
  scheduledDate: string;
  scheduledTime: string;
  scheduledSlotLabel?: string;
  category: ScheduledOrderCategory;
  address: OrderAddress;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  storeName?: string;
  storeId?: string;
  preferredCaptainId?: string;
  paymentMethod?: 'CASH_ON_DELIVERY';
}

interface ScheduledOrderState {
  scheduledOrders: ScheduledOrder[];
  captainNotifications: CaptainNotificationAlert[];
  isScheduleModalOpen: boolean;
  preselectedCategory: ScheduledOrderCategory | null;
  openScheduleModal: (category?: ScheduledOrderCategory) => void;
  closeScheduleModal: () => void;
  createScheduledOrder: (params: CreateScheduledOrderParams) => Promise<ScheduledOrder>;
  updateScheduledOrderStatus: (orderId: string, status: ScheduledOrder['status']) => Promise<void>;
  acknowledgeOrderByCaptain: (orderId: string, captainId: string) => Promise<void>;
  cancelScheduledOrder: (orderId: string, reason?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  clearCaptainNotifications: (captainId: string) => void;
  getCaptainNotifications: (captainId: string) => CaptainNotificationAlert[];
  getUnreadNotificationsCount: (captainId: string) => number;
  generateCaptainWhatsAppDispatchText: (order: ScheduledOrder) => string;
}

const mapOrder = (o: any): ScheduledOrder => ({
  id: o.id, order_number: o.order_number, customer_id: o.customer_id,
  customer_name: o.customer?.full_name || '', customer_phone: o.customer?.phone || '',
  business_id: o.business_id, business_name: o.business?.name || '',
  captain_id: o.captain_id || undefined, category: (o.category || 'market') as ScheduledOrderCategory,
  category_label_ku: o.category === 'food' ? 'چێشتخانە' : 'مارکێت',
  status: o.status, payment_status: o.payment_status, payment_method: o.payment_method || 'CASH_ON_DELIVERY',
  subtotal: Number(o.subtotal || 0), delivery_fee: Number(o.delivery_fee || 0),
  platform_fee: Number(o.platform_fee || 0), captain_fee: Math.max(0,Number(o.delivery_fee||0)-Number(o.platform_fee||0)),
  discount: Number(o.discount || 0), total: Number(o.total || 0),
  scheduled_date: o.scheduled_at ? new Date(o.scheduled_at).toISOString().slice(0,10) : '',
  scheduled_time: o.scheduled_at ? new Date(o.scheduled_at).toTimeString().slice(0,5) : '',
  scheduled_slot_label: o.scheduled_slot_label || '', address: o.address || {},
  notes: o.notes, items: (o.items || []).map((i:any)=>({ id:i.id, name:i.product?.name||'', price:Number(i.unit_price||0), quantity:i.quantity, notes:i.notes })),
  created_at: o.created_at, captain_notified: Boolean(o.captain_id), captain_notified_at: o.captain_id ? o.created_at : '',
});

export const useScheduledOrderStore = create<ScheduledOrderState>((set, get) => ({
  scheduledOrders: [], captainNotifications: [], isScheduleModalOpen: false, preselectedCategory: null,

  openScheduleModal: (category) => set({ isScheduleModalOpen:true, preselectedCategory:category||null }),
  closeScheduleModal: () => set({ isScheduleModalOpen:false, preselectedCategory:null }),

  createScheduledOrder: async (params) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Authentication required');
    if (!params.storeId) throw new Error('A store is required');

    const scheduledAt = new Date(`${params.scheduledDate}T${params.scheduledTime}:00`).toISOString();
    const subtotal = params.items.reduce((sum,i)=>sum+i.price*i.quantity,0);
    const deliveryFee = 0;
    const platformFee = 0;
    const total = Math.max(0, subtotal + deliveryFee - 0);
    const orderNumber = `SHAKH-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase.from('orders').insert({
      order_number: orderNumber, customer_id: user.id, business_id: params.storeId,
      captain_id: params.preferredCaptainId || null, status:'NEW', payment_status:'PENDING',
      payment_method: params.paymentMethod || 'CASH_ON_DELIVERY', subtotal, discount:0,
      delivery_fee:deliveryFee, platform_fee:platformFee, total, commission:0,
      address:params.address, latitude:params.address.latitude || null, longitude:params.address.longitude || null,
      notes:params.notes || null, category:params.category, is_scheduled:true,
      scheduled_at:scheduledAt, scheduled_slot_label:params.scheduledSlotLabel || null,
    }).select('*').single();
    if (error || !data) throw error || new Error('Unable to create order');

    const { error: itemsError } = await supabase.from('order_items').insert(params.items.map(i=>({
      order_id:data.id, product_id:i.id || null, quantity:i.quantity, unit_price:i.price, discount:0,
      total:i.price*i.quantity, notes:i.notes || null
    })));
    if (itemsError) throw itemsError;

    const order = mapOrder({...data, customer:{full_name:params.customerName||user.user_metadata?.full_name||'',phone:params.customerPhone||''},business:{name:params.storeName||''},items:params.items});
    set({ scheduledOrders:[order,...get().scheduledOrders], isScheduleModalOpen:false });
    dispatchNotification({ title:'داواکاری خشتەکرا تۆمارکرا', body:`#${order.order_number} بە سەرکەوتوویی تۆمارکرا.`, url:'/orders', data:{orderId:order.id} });
    return order;
  },

  updateScheduledOrderStatus: async (orderId,status) => {
    await supabase.from('orders').update({status}).eq('id',orderId);
    set({ scheduledOrders:get().scheduledOrders.map(o=>o.id===orderId?{...o,status}:o) });
  },

  acknowledgeOrderByCaptain: async (orderId,captainId) => {
    await supabase.from('orders').update({captain_id:captainId,status:'ACCEPTED'}).eq('id',orderId);
    set({ scheduledOrders:get().scheduledOrders.map(o=>o.id===orderId?{...o,captain_id:captainId,status:'ACCEPTED'}:o) });
  },

  cancelScheduledOrder: async (orderId) => {
    await supabase.from('orders').update({status:'CANCELLED'}).eq('id',orderId);
    set({ scheduledOrders:get().scheduledOrders.map(o=>o.id===orderId?{...o,status:'CANCELLED'}:o) });
  },

  markNotificationAsRead: (id) => set({captainNotifications:get().captainNotifications.map(n=>n.id===id?{...n,read:true}:n)}),
  clearCaptainNotifications: (captainId) => set({captainNotifications:get().captainNotifications.filter(n=>n.captain_id!==captainId)}),
  getCaptainNotifications: (captainId) => get().captainNotifications.filter(n=>n.captain_id===captainId),
  getUnreadNotificationsCount: (captainId) => get().captainNotifications.filter(n=>n.captain_id===captainId&&!n.read).length,

  generateCaptainWhatsAppDispatchText: (order) => encodeURIComponent(
    `SHAKH Scheduled Order #${order.order_number}\n${order.scheduled_date} ${order.scheduled_time}\n${order.business_name}\n${order.customer_name}\n${order.customer_phone}\n${order.address.city||''}, ${order.address.district||''}, ${order.address.street||''}\nTotal: ${order.total.toLocaleString()} IQD`
  ),
}));
