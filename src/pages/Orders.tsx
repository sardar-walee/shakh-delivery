import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Navigation,
  Package,
  Receipt,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Database } from '../types/database.types';
import { TrackedOrder } from '../types/order';
import OrderTrackingVisualizer from '../components/orders/OrderTrackingVisualizer';
import OrderTrackingModal from '../components/orders/OrderTrackingModal';
import OrderReceiptModal from '../components/orders/OrderReceiptModal';
import { sendReceiptViaWhatsApp } from '../utils/whatsappReceipt';
import { isValidUUID } from '../utils/uuid';

type DbOrder = Database['public']['Tables']['orders']['Row'];

const DEMO_ORDER: TrackedOrder = {
  id: 'demo-order-101',
  order_number: 'SHAKH-84920412',
  customer_id: 'cust-demo',
  business_id: 'biz-1',
  captain_id: 'capt-1',
  status: 'ON_THE_WAY',
  payment_status: 'Cash on Delivery (COD)',
  subtotal: 24500,
  delivery_fee: 3000,
  platform_fee: 500,
  discount: 2000,
  total: 26000,
  address: {
    street: 'Bakhtiyari Main St, Near Family Mall',
    city: 'Erbil',
    district: 'Erbil Central',
    building: 'A3, Apt 14',
  },
  latitude: 36.205,
  longitude: 44.025,
  notes: 'Please call when arriving at gate 2',
  created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  estimated_delivery_minutes: 14,
  business: {
    id: 'biz-1',
    name: 'Burger Lab Erbil (100M)',
    phone: '+964 750 123 4567',
    address: '100 Meter St, Erbil',
    latitude: 36.1912,
    longitude: 44.0092,
  },
  captain: {
    id: 'capt-1',
    name: 'ئاراس ئەحمەد (Aras Ahmed)',
    phone: '+964 750 444 8899',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    vehicleType: 'motorcycle',
    vehiclePlate: 'Erbil 48291 A',
    rating: 4.9,
    totalDeliveries: 1420,
  },
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const isRtl = i18n.language !== 'en';
  
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<TrackedOrder | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<TrackedOrder | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!isValidUUID(user.id)) {
          setOrders([]);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          if (error.code === '22P02') {
            setOrders([]);
            return;
          }
          throw error;
        }
        setOrders(data || []);

        // Find active order to display tracking visualizer
        const active = (data || []).find((o) =>
          ['NEW', 'ACCEPTED', 'CONFIRMED', 'PREPARING', 'READY', 'CAPTAIN_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(
            o.status
          )
        );
        if (active) {
          setActiveTrackingOrder(active as unknown as TrackedOrder);
        }
      } catch (err: any) {
        if (err?.code === '22P02') {
          setOrders([]);
        } else {
          console.warn('Orders query note:', err?.message || err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to realtime order updates for this customer (only if valid UUID)
    let subscription: any = null;
    if (isValidUUID(user.id)) {
      subscription = supabase
        .channel(`public:customer-orders:${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `customer_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrd = payload.new as DbOrder;
            setOrders(prev => [newOrd, ...prev]);
            setActiveTrackingOrder(newOrd as unknown as TrackedOrder);
          } else if (payload.eventType === 'UPDATE') {
            const updOrd = payload.new as DbOrder;
            setOrders(prev => prev.map(o => o.id === updOrd.id ? updOrd : o));
            setActiveTrackingOrder(prev => (prev?.id === updOrd.id ? (updOrd as unknown as TrackedOrder) : prev));
          }
        })
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 card max-w-xl mx-auto space-y-4">
        <ClipboardList className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold">{t('login')} to view orders</h2>
        <p className="text-sm text-slate-500">Sign in to track orders and delivery status in real-time.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ACCEPTED': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'PREPARING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'READY': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'CAPTAIN_ASSIGNED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'PICKED_UP': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
      case 'ON_THE_WAY': return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 animate-pulse';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'ON_THE_WAY': return <Navigation className="w-5 h-5 text-primary-600 animate-bounce" />;
      case 'CANCELLED': return <Clock className="w-5 h-5 text-rose-600" />;
      default: return <Package className="w-5 h-5 text-primary-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Page Title & Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-primary-600" />
            <span>{t('orders')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRtl
              ? 'بەدواداچوونی ڕاستەوخۆی بار و شوێنی داواکارییەکان بە سوپابەیس'
              : 'Real-time order progress & GPS tracking powered by Supabase'}
          </p>
        </div>

        {/* Demo Live Tracker Trigger */}
        <button
          onClick={() => setActiveTrackingOrder(DEMO_ORDER)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all group"
        >
          <Zap className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          <span>{isRtl ? 'تاقیکردنەوەی بەدواداچوونی ڕاستەوخۆ' : 'Test Live Visualizer'}</span>
        </button>
      </div>

      {/* ACTIVE REAL-TIME ORDER TRACKING VISUALIZER (HERO SECTION) */}
      {activeTrackingOrder && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{isRtl ? 'داواکاری لە کاتی جێبەجێکردندا' : 'Active In-Flight Delivery'}</span>
            </div>
            <button
              onClick={() => setActiveTrackingOrder(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {isRtl ? 'داخستنی بەدواداچوون' : 'Hide Live Tracker'}
            </button>
          </div>

          <OrderTrackingVisualizer initialOrder={activeTrackingOrder} />
        </div>
      )}

      {/* ALL ORDERS LIST */}
      <div className="space-y-4 pt-2">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <span>{isRtl ? 'مێژووی هەموو داواکارییەکان' : 'All Orders History'}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {orders.length}
          </span>
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="card p-0 overflow-hidden hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800"
              >
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-0.5 font-mono">
                        #{order.order_number.substring(0, 8)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {order.total.toLocaleString()} IQD
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-800/50 p-3.5 px-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    <span>{order.payment_status}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setSelectedOrderForReceipt(order as unknown as TrackedOrder)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                      title="View Official SHAKH Receipt & WhatsApp"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{isRtl ? 'وەسلی کڕین' : 'Receipt'}</span>
                    </button>

                    <button
                      onClick={() => sendReceiptViaWhatsApp(order as unknown as TrackedOrder, null, isRtl ? (i18n.language === 'ar' ? 'ar' : 'ku') : 'en')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                      title="Send via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isRtl ? 'واتس ئاپ' : 'WhatsApp'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTrackingOrder(order as unknown as TrackedOrder)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'بەدواداچوون' : 'Live Track'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedOrderForModal(order as unknown as TrackedOrder)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 transition-colors"
                    >
                      {t('view_details')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card space-y-3">
            <ClipboardList className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {t('no_active_orders')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isRtl
                ? 'کاتێک داواکاری تۆمار دەکەیت لە فرۆشگاکان، بەدواداچوونی ڕاستەوخۆ لێرە دەردەکەوێت.'
                : 'When you place orders, real-time tracking will appear here automatically.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => setActiveTrackingOrder(DEMO_ORDER)}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-500 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{isRtl ? 'تاقیکردنەوەی بەدواداچوونی مۆدێل' : 'Preview Live Demo'}</span>
              </button>

              <button
                onClick={() => setSelectedOrderForReceipt(DEMO_ORDER)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{isRtl ? 'وەسلی کڕین و وەتسئاپ (Demo)' : 'Sample WhatsApp Receipt'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View for Order Tracking */}
      <OrderTrackingModal
        order={selectedOrderForModal}
        isOpen={Boolean(selectedOrderForModal)}
        onClose={() => setSelectedOrderForModal(null)}
      />

      {/* Modal View for SHAKH Official Receipt & WhatsApp */}
      <OrderReceiptModal
        order={selectedOrderForReceipt}
        isOpen={Boolean(selectedOrderForReceipt)}
        onClose={() => setSelectedOrderForReceipt(null)}
      />
    </div>
  );
}
