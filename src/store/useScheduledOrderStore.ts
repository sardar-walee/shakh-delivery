import { create } from 'zustand';
import { ScheduledOrder, CaptainNotificationAlert, OrderAddress, OrderItem, CaptainInfo, ScheduledOrderCategory } from '../types/order';
import { dispatchNotification } from '../lib/notifications';
import { useCaptainFinanceStore } from './useCaptainFinanceStore';

const ORDERS_STORAGE_KEY = 'shakh_scheduled_orders_v1';
const NOTIFS_STORAGE_KEY = 'shakh_captain_notifications_v1';

export const DEFAULT_CAPTAINS: CaptainInfo[] = [
  {
    id: 'capt-ahmed',
    name: 'کاپتن ئەحمەد (Captain Ahmed)',
    phone: '+964 750 123 4567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 18920 B',
    vehicleType: 'motorcycle',
    rating: 4.95,
    totalDeliveries: 1540,
  },
  {
    id: 'capt-rebin',
    name: 'کاپتن ڕێبین (Captain Rebin)',
    phone: '+964 750 789 0123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 44102 A',
    vehicleType: 'motorcycle',
    rating: 4.88,
    totalDeliveries: 980,
  },
  {
    id: 'capt-karwan',
    name: 'کاپتن کاروان (Captain Karwan)',
    phone: '+964 750 456 7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    vehiclePlate: 'Erbil 90214 H',
    vehicleType: 'car',
    rating: 4.92,
    totalDeliveries: 1210,
  },
];

// Helper to get formatted date string (YYYY-MM-DD)
const getFutureDateString = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const INITIAL_SCHEDULED_ORDERS: ScheduledOrder[] = [
  {
    id: 'sch-ord-101',
    order_number: 'SHAKH-SCH-FD841',
    customer_id: 'cust-demo',
    customer_name: 'سەردار خانۆ (Sardar Xano)',
    customer_phone: '0750 444 8899',
    business_id: 'biz-burger-lab',
    business_name: 'بەرگەر لاب (Burger Lab - 100M)',
    captain_id: 'capt-ahmed',
    category: 'food',
    category_label_ku: 'چێشتخانە (Food & Dining)',
    status: 'CONFIRMED',
    payment_status: 'کاش لە کاتی وەرگرتن (COD)',
    payment_method: 'CASH_ON_DELIVERY',
    subtotal: 24500,
    delivery_fee: 3000,
    platform_fee: 750,
    captain_fee: 2250,
    discount: 0,
    total: 27500,
    scheduled_date: getFutureDateString(1), // Tomorrow
    scheduled_time: '13:30',
    scheduled_slot_label: '13:30 - 14:00 (نیوەڕۆ / Lunch)',
    address: {
      label: 'ماڵەوە / Home',
      city: 'هەولێر (Erbil)',
      district: 'بەختیاری',
      street: 'شەقامی سەرەکی بەرامبەر پارکی بەختیاری',
      building: 'بینای بەختیاری تاوەر',
      apartment: 'شوقەی 14',
      phone: '0750 444 8899',
      notes: 'تکایە کاتژمێر 1:20 پەیوەندی بکە بەر لە گەیشتن',
    },
    notes: 'پیازی سوورکراوە و سۆسی زیادەی لەگەڵ بێت',
    items: [
      {
        id: 'it-1',
        name: 'دۆبڵ چیزبەرگەر لەگەڵ چپس',
        name_ku: 'دۆبڵ چیزبەرگەر لەگەڵ چپس',
        name_ar: 'دبل تشيز برجر مع بطاطس',
        price: 16500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'it-2',
        name: 'پەتاتەی کریسپی بە پەنیری چێدار',
        name_ku: 'پەتاتەی کریسپی بە پەنیری چێدار',
        name_ar: 'بطاطس مقرمشة مع جبن شيدر',
        price: 5500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'it-3',
        name: 'کۆلا قتووی سارد',
        name_ku: 'کۆلا قتووی سارد',
        name_ar: 'كولا بارد علبة',
        price: 2500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&auto=format&fit=crop&q=80',
      },
    ],
    captain: DEFAULT_CAPTAINS[0],
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    captain_notified: true,
    captain_notified_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    captain_acknowledged: true,
  },
  {
    id: 'sch-ord-102',
    order_number: 'SHAKH-SCH-MK902',
    customer_id: 'cust-demo',
    customer_name: 'شەیما ئەحمەد',
    customer_phone: '0750 112 3344',
    business_id: 'biz-carrefour',
    business_name: 'کارفوور مارکێت (Carrefour Market)',
    captain_id: 'capt-ahmed',
    category: 'market',
    category_label_ku: 'مارکێت و پێداویستی (Market & Grocery)',
    status: 'ACCEPTED',
    payment_status: 'کاش لە کاتی وەرگرتن (COD)',
    payment_method: 'CASH_ON_DELIVERY',
    subtotal: 36000,
    delivery_fee: 3000,
    platform_fee: 750,
    captain_fee: 2250,
    discount: 0,
    total: 39000,
    scheduled_date: getFutureDateString(2), // In 2 days
    scheduled_time: '18:30',
    scheduled_slot_label: '18:30 - 19:00 (ئێوارە / Evening)',
    address: {
      label: 'ماڵەوە',
      city: 'هەولێر',
      district: 'وەزیران',
      street: 'کۆڵانی 44، ماڵی ژمارە 12',
      phone: '0750 112 3344',
      notes: 'ئەگەر لە دەرگاتان دا وەڵام نەبوو لە تەنیشت دەرگای حەوشە دایبنێن',
    },
    notes: 'تکایە شیری تازە و میوەی بەسەوزییەوە هەڵبژێرن',
    items: [
      {
        id: 'it-4',
        name: 'پاکێتی سەبەتەی میوەی تازە (سێو، مۆز، پرتەقاڵ)',
        name_ku: 'پاکێتی سەبەتەی میوەی تازە',
        name_ar: 'سلة فواكه طازجة مشكلة',
        price: 18000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'it-5',
        name: 'شیری تازەی ئەلبان ٢ لیتر',
        name_ku: 'شیری تازەی ئەلبان ٢ لیتر',
        name_ar: 'حليب ألبان طازج ٢ لتر',
        price: 6000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'it-6',
        name: 'قاوەی کوردی بە هێل ٥٠٠ گرام',
        name_ku: 'قاوەی کوردی بە هێل ٥٠٠ گرام',
        name_ar: 'قهوة كردية بالهيل ٥٠٠ غرام',
        price: 6000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
      },
    ],
    captain: DEFAULT_CAPTAINS[0],
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    captain_notified: true,
    captain_notified_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    captain_acknowledged: false,
  },
];

const INITIAL_CAPTAIN_NOTIFICATIONS: CaptainNotificationAlert[] = [
  {
    id: 'notif-alert-1',
    captain_id: 'capt-ahmed',
    order_id: 'sch-ord-101',
    order_number: 'SHAKH-SCH-FD841',
    category: 'food',
    title: 'New Scheduled Food Order Dispatched!',
    title_ku: '🔔 داواکاری نوێی چێشتخانە خشتەکرا بۆتۆ!',
    message: 'Food delivery scheduled for tomorrow at 13:30 from Burger Lab Erbil.',
    message_ku: 'داواکارییەکی چێشتخانەی (Burger Lab) بە کۆی 27,500 IQD بۆ سبەی کاتژمێر 13:30 خشتە کرا.',
    scheduled_date: getFutureDateString(1),
    scheduled_time: '13:30',
    customer_name: 'سەردار خانۆ',
    customer_phone: '0750 444 8899',
    store_name: 'بەرگەر لاب (Burger Lab)',
    delivery_address: 'هەولێر، بەختیاری، بینای بەختیاری تاوەر',
    total_amount: 27500,
    captain_earnings: 2250,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-alert-2',
    captain_id: 'capt-ahmed',
    order_id: 'sch-ord-102',
    order_number: 'SHAKH-SCH-MK902',
    category: 'market',
    title: 'New Scheduled Supermarket Order Dispatched!',
    title_ku: '🛒 داواکاری مارکێت خشتەکرا بۆتۆ!',
    message: 'Market delivery scheduled for 2 days ahead at 18:30 from Carrefour.',
    message_ku: 'داواکاری مارکێتی (Carrefour Market) بە کۆی 39,000 IQD بۆ دوو ڕۆژی تر کاتژمێر 18:30 خشتە کرا.',
    scheduled_date: getFutureDateString(2),
    scheduled_time: '18:30',
    customer_name: 'شەیما ئەحمەد',
    customer_phone: '0750 112 3344',
    store_name: 'کارفوور مارکێت (Carrefour)',
    delivery_address: 'هەولێر، وەزیران، کۆڵانی 44',
    total_amount: 39000,
    captain_earnings: 2250,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
    priority: 'normal',
  },
];

interface CreateScheduledOrderParams {
  items: OrderItem[];
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  scheduledSlotLabel?: string;
  category: ScheduledOrderCategory;
  address: OrderAddress;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  storeName?: string;
  storeId?: string;
  preferredCaptainId?: string;
  paymentMethod?: 'CASH_ON_DELIVERY' | 'FIB' | 'FASTPAY' | 'ZAIN_CASH';
}

interface ScheduledOrderState {
  scheduledOrders: ScheduledOrder[];
  captainNotifications: CaptainNotificationAlert[];
  isScheduleModalOpen: boolean;
  preselectedCategory: ScheduledOrderCategory | null;

  // Modal controls
  openScheduleModal: (category?: ScheduledOrderCategory) => void;
  closeScheduleModal: () => void;

  // Order Operations
  createScheduledOrder: (params: CreateScheduledOrderParams) => ScheduledOrder;
  updateScheduledOrderStatus: (orderId: string, status: ScheduledOrder['status']) => void;
  acknowledgeOrderByCaptain: (orderId: string, captainId: string) => void;
  cancelScheduledOrder: (orderId: string, reason?: string) => void;

  // Captain Notification Operations
  markNotificationAsRead: (notificationId: string) => void;
  clearCaptainNotifications: (captainId: string) => void;
  getCaptainNotifications: (captainId: string) => CaptainNotificationAlert[];
  getUnreadNotificationsCount: (captainId: string) => number;
  generateCaptainWhatsAppDispatchText: (order: ScheduledOrder) => string;
}

export const useScheduledOrderStore = create<ScheduledOrderState>((set, get) => {
  // Load saved state or use initial
  let initialOrders = INITIAL_SCHEDULED_ORDERS;
  let initialNotifs = INITIAL_CAPTAIN_NOTIFICATIONS;

  try {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (savedOrders) {
      initialOrders = JSON.parse(savedOrders);
    }
    const savedNotifs = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (savedNotifs) {
      initialNotifs = JSON.parse(savedNotifs);
    }
  } catch (e) {
    console.warn('Could not load scheduled orders from storage:', e);
  }

  const persist = (orders: ScheduledOrder[], notifs: CaptainNotificationAlert[]) => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Could not persist scheduled orders:', e);
    }
  };

  return {
    scheduledOrders: initialOrders,
    captainNotifications: initialNotifs,
    isScheduleModalOpen: false,
    preselectedCategory: null,

    openScheduleModal: (category) => {
      set({ isScheduleModalOpen: true, preselectedCategory: category || null });
    },

    closeScheduleModal: () => {
      set({ isScheduleModalOpen: false, preselectedCategory: null });
    },

    createScheduledOrder: (params) => {
      const {
        items,
        scheduledDate,
        scheduledTime,
        scheduledSlotLabel = `${scheduledTime} (دیاریکراو / Scheduled)`,
        category,
        address,
        customerName = 'کڕیاری شاخ (SHAKH User)',
        customerPhone = '0750 000 0000',
        notes = '',
        storeName = category === 'food' ? 'چێشتخانەی هاوبەش' : 'مارکێتی شاخ',
        storeId = 'biz-general',
        preferredCaptainId = 'capt-ahmed',
        paymentMethod = 'CASH_ON_DELIVERY',
      } = params;

      // Calculate Subtotal & Fees
      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const deliveryFee = items.length > 0 ? 3000 : 0;
      const platformFee = 750;
      const captainFee = 2250;
      const total = subtotal + deliveryFee;

      // Select Captain
      const assignedCaptain =
        DEFAULT_CAPTAINS.find((c) => c.id === preferredCaptainId) || DEFAULT_CAPTAINS[0];

      // Generate Order Number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = category === 'food' ? 'FD' : 'MK';
      const orderNumber = `SHAKH-SCH-${prefix}${randomDigits}`;
      const orderId = `sch-ord-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const newOrder: ScheduledOrder = {
        id: orderId,
        order_number: orderNumber,
        customer_id: 'cust-current',
        customer_name: customerName,
        customer_phone: customerPhone,
        business_id: storeId,
        business_name: storeName,
        captain_id: assignedCaptain.id,
        category,
        category_label_ku: category === 'food' ? 'چێشتخانە (Food & Dining)' : 'مارکێت و پێداویستی (Market & Grocery)',
        status: 'CONFIRMED',
        payment_status: 'کاش لە کاتی وەرگرتن (COD)',
        payment_method: paymentMethod,
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        captain_fee: captainFee,
        discount: 0,
        total,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        scheduled_slot_label: scheduledSlotLabel,
        address,
        notes,
        items,
        captain: assignedCaptain,
        created_at: nowIso,
        captain_notified: true,
        captain_notified_at: nowIso,
        captain_acknowledged: false,
      };

      // 1. Generate Captain Notification Alert
      const notifId = `notif-${Date.now()}`;
      const formattedAddress = `${address.district || ''} ${address.street || ''} ${address.city || ''}`.trim() || 'هەولێر';
      
      const newNotification: CaptainNotificationAlert = {
        id: notifId,
        captain_id: assignedCaptain.id,
        order_id: orderId,
        order_number: orderNumber,
        category,
        title: `New Scheduled ${category === 'food' ? 'Food' : 'Market'} Order Dispatched!`,
        title_ku: `🔔 داواکاری نوێی ${category === 'food' ? 'چێشتخانە' : 'مارکێت'} خشتەکرا بۆ ${assignedCaptain.name}!`,
        message: `Order #${orderNumber} scheduled for ${scheduledDate} at ${scheduledTime}. Customer: ${customerName}.`,
        message_ku: `ئۆردەری #${orderNumber} بە بڕی ${total.toLocaleString()} IQD بۆ بەرواری ${scheduledDate} کاتژمێر ${scheduledTime} بۆتۆ ڕەوانە کرا.`,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        customer_name: customerName,
        customer_phone: customerPhone,
        store_name: storeName,
        delivery_address: formattedAddress,
        total_amount: total,
        captain_earnings: captainFee,
        timestamp: nowIso,
        read: false,
        priority: 'high',
      };

      // 2. Dispatch Live In-App System Notification & Native Push
      dispatchNotification({
        title: newNotification.title_ku,
        body: newNotification.message_ku,
        url: '/orders',
        data: {
          orderId,
          captainId: assignedCaptain.id,
          orderNumber,
          scheduledDate,
          scheduledTime,
          category,
        },
      });

      // 3. Update store states & persist
      const updatedOrders = [newOrder, ...get().scheduledOrders];
      const updatedNotifs = [newNotification, ...get().captainNotifications];

      set({
        scheduledOrders: updatedOrders,
        captainNotifications: updatedNotifs,
        isScheduleModalOpen: false,
      });

      persist(updatedOrders, updatedNotifs);

      return newOrder;
    },

    updateScheduledOrderStatus: (orderId, status) => {
      const { scheduledOrders, captainNotifications } = get();
      const updatedOrders = scheduledOrders.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          // If marked DELIVERED, record to captain finance
          if (status === 'DELIVERED') {
            try {
              useCaptainFinanceStore.getState().addOrderToCaptain(o.captain_id, {
                orderNumber: o.order_number,
                category: o.category,
                categoryLabelKu: o.category_label_ku,
                storeName: o.business_name,
                customerName: o.customer_name,
                customerPhone: o.customer_phone,
                deliveryAddress: `${o.address.district || ''} ${o.address.street || ''}`,
                orderAmount: o.subtotal,
                deliveryFee: o.delivery_fee,
                captainDeliveryFee: o.captain_fee,
                platformFee: o.platform_fee,
                totalCashCollected: o.total,
                paymentMethod: o.payment_method,
              });
            } catch (e) {
              console.warn('Failed to sync completed scheduled order with captain finances:', e);
            }
          }
          return updated;
        }
        return o;
      });

      set({ scheduledOrders: updatedOrders });
      persist(updatedOrders, captainNotifications);
    },

    acknowledgeOrderByCaptain: (orderId, captainId) => {
      const { scheduledOrders, captainNotifications } = get();
      const updatedOrders = scheduledOrders.map((o) => {
        if (o.id === orderId) {
          return { ...o, captain_acknowledged: true, status: 'ACCEPTED' as const };
        }
        return o;
      });

      const updatedNotifs = captainNotifications.map((n) => {
        if (n.order_id === orderId && n.captain_id === captainId) {
          return { ...n, read: true };
        }
        return n;
      });

      set({ scheduledOrders: updatedOrders, captainNotifications: updatedNotifs });
      persist(updatedOrders, updatedNotifs);

      // Dispatch feedback notification
      dispatchNotification({
        title: 'کاپتن ئۆردەرەکەی پەسەند کرد / Captain Acknowledged',
        body: `کاپتن ئاگاداری داواکاری خشتەکراوی ژمارە ${orderId} وەرگرت و ئامادەیە بۆ گەیاندن.`,
      });
    },

    cancelScheduledOrder: (orderId) => {
      const { scheduledOrders, captainNotifications } = get();
      const updatedOrders = scheduledOrders.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: 'CANCELLED' as const };
        }
        return o;
      });

      set({ scheduledOrders: updatedOrders });
      persist(updatedOrders, captainNotifications);

      dispatchNotification({
        title: 'داواکاری خشتەکراو هەڵوەشێندرایەوە / Scheduled Order Cancelled',
        body: `داواکاری ژمارە ${orderId} هەڵوەشێندرایەوە و ئاگاداری بۆ کاپتن نێردرا.`,
      });
    },

    markNotificationAsRead: (notificationId) => {
      const { scheduledOrders, captainNotifications } = get();
      const updatedNotifs = captainNotifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      set({ captainNotifications: updatedNotifs });
      persist(scheduledOrders, updatedNotifs);
    },

    clearCaptainNotifications: (captainId) => {
      const { scheduledOrders, captainNotifications } = get();
      const updatedNotifs = captainNotifications.filter((n) => n.captain_id !== captainId);
      set({ captainNotifications: updatedNotifs });
      persist(scheduledOrders, updatedNotifs);
    },

    getCaptainNotifications: (captainId) => {
      return get().captainNotifications.filter((n) => n.captain_id === captainId);
    },

    getUnreadNotificationsCount: (captainId) => {
      return get().captainNotifications.filter((n) => n.captain_id === captainId && !n.read).length;
    },

    generateCaptainWhatsAppDispatchText: (order) => {
      const isFood = order.category === 'food';
      const itemsFormatted = order.items
        .map((it) => `• ${it.quantity}x ${it.name_ku || it.name} (${(it.price * it.quantity).toLocaleString()} IQD)`)
        .join('\n');

      return encodeURIComponent(
        `🚨 *ئاگاداری داواکاری خشتەکراو لە پلاتفۆرمی شاخ / SHAKH Scheduled Dispatch* 🚨\n\n` +
        `کاپتنی بەڕێز: *${order.captain.name}*\n` +
        `بۆتۆ دانراوە: *${isFood ? '🍔 چێشتخانە و خۆراک (Food)' : '🛒 مارکێت و پێداویستی (Market)'}*\n\n` +
        `📋 *زانیاری داواکاری:*\n` +
        `• ژمارەی داواکاری: #${order.order_number}\n` +
        `• بەرواری گەیاندن: 📅 *${order.scheduled_date}*\n` +
        `• کاتی گەیاندن: ⏰ *${order.scheduled_time} (${order.scheduled_slot_label})*\n` +
        `• فرۆشگا / شوێنی وەرگرتن: 🏬 *${order.business_name}*\n\n` +
        `👤 *زانیاری کڕیار:*\n` +
        `• ناو: ${order.customer_name}\n` +
        `• مۆبایل: ${order.customer_phone}\n` +
        `• ناونیشان: 📍 ${order.address.city || ''}، ${order.address.district || ''}، ${order.address.street || ''} (بینا: ${order.address.building || ''})\n` +
        (order.notes ? `• تێبینی کڕیار: "${order.notes}"\n\n` : '\n') +
        `📦 *کاڵاکان:*\n${itemsFormatted}\n\n` +
        `💰 *حیسابات:*\n` +
        `• کۆی پارەی کاش لە کڕیار: *${order.total.toLocaleString()} IQD*\n` +
        `• پشکی کرێی کاپتن: *${order.captain_fee.toLocaleString()} IQD*\n` +
        `• شێوازی پارەدان: کاش لە کاتی وەرگرتن (COD)\n\n` +
        `تکایە ۳۰ خولەک بەر لە کاتی دیاریکراو ئامادەبە بۆ وەرگرتنی لە فرۆشگا.`
      );
    },
  };
});
