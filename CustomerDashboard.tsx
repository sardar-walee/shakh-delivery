import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Bike,
  Store,
  MapPin,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderTrackingVisualizer from '../orders/OrderTrackingVisualizer';
import OrderReceiptModal from '../orders/OrderReceiptModal';
import CarPostAnalytics from './CarPostAnalytics';
import { sendReceiptViaWhatsApp } from '../../utils/whatsappReceipt';
import { TrackedOrder } from '../../types/order';

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  subtotal?: number;
  delivery_fee?: number;
  discount?: number;
  platform_fee?: number;
  payment_status?: string;
  address?: any;
  latitude?: number;
  longitude?: number;
}

export default function CustomerDashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language !== 'en';
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<TrackedOrder | null>(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const activeOrder = orders.find((o) =>
    ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'CAPTAIN_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(
      o.status
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Card */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-200">
            Customer Hub
          </span>
          <h1 className="text-2xl font-bold font-display mt-0.5">Welcome back to SHAKH</h1>
          <p className="text-primary-100 text-xs md:text-sm mt-1">
            Track your deliveries in real-time, view loyalty points, and reorder from your favorite stores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="px-4 py-2.5 rounded-xl bg-white text-primary-700 font-bold text-xs hover:bg-primary-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <span>Explore Stores</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Rewards & Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            SHAKH Points
          </div>
          <div className="text-xl font-bold font-display text-amber-500">1,250 Pts</div>
          <span className="text-[11px] text-slate-400">Worth 12,500 IQD off</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Total Orders Placed</div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {orders.length}
          </div>
          <span className="text-[11px] text-slate-400">Lifetime orders</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Saved Addresses</div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">2</div>
          <span className="text-[11px] text-slate-400">Home (Bakhtiyari), Office</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Active Delivery</div>
          <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {activeOrder ? 'In Transit' : 'None'}
          </div>
          <span className="text-[11px] text-slate-400">{activeOrder ? 'Track live below' : 'Ready to order'}</span>
        </div>
      </div>

      {/* Car Posts Analytics for the Customer */}
      <CarPostAnalytics />

      {/* Live Active Order Status Tracker */}
      {activeOrder && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Delivery Tracking</span>
          </div>
          <OrderTrackingVisualizer
            initialOrder={{
              id: activeOrder.id,
              order_number: activeOrder.order_number,
              customer_id: 'cust-current',
              business_id: 'biz-current',
              status: activeOrder.status as any,
              payment_status: activeOrder.payment_status || 'Cash on Delivery',
              subtotal: activeOrder.subtotal || activeOrder.total - 3000,
              delivery_fee: activeOrder.delivery_fee || 3000,
              platform_fee: activeOrder.platform_fee || 500,
              discount: activeOrder.discount || 0,
              total: activeOrder.total,
              address: activeOrder.address || 'Bakhtiyari, Erbil',
              latitude: activeOrder.latitude || 36.205,
              longitude: activeOrder.longitude || 44.025,
              created_at: activeOrder.created_at,
              updated_at: new Date().toISOString(),
              estimated_delivery_minutes: 18,
            }}
          />
        </div>
      )}

      {/* Order History */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Recent Purchases & History
          </h2>
          <button
            onClick={fetchCustomerOrders}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((order) => (
            <div key={order.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                  #{order.order_number.substring(0, 8)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(order.created_at).toLocaleDateString()} • {order.total.toLocaleString()} IQD
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedReceiptOrder({
                      id: order.id,
                      order_number: order.order_number,
                      customer_id: 'cust-1',
                      business_id: 'biz-1',
                      status: order.status as any,
                      payment_status: 'PAID (Online / COD)',
                      subtotal: order.total - 3500,
                      delivery_fee: 3000,
                      platform_fee: 500,
                      discount: 0,
                      total: order.total,
                      created_at: order.created_at,
                      updated_at: order.created_at,
                      address: { label: 'Erbil Delivery Address' },
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  title="Official Receipt"
                >
                  <Receipt className="w-3 h-3 text-amber-500" />
                  <span>{isRtl ? 'وەسل' : 'Receipt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendReceiptViaWhatsApp(
                      {
                        id: order.id,
                        order_number: order.order_number,
                        customer_id: 'cust-1',
                        business_id: 'biz-1',
                        status: order.status as any,
                        payment_status: 'PAID',
                        subtotal: order.total - 3500,
                        delivery_fee: 3000,
                        platform_fee: 500,
                        discount: 0,
                        total: order.total,
                        created_at: order.created_at,
                        updated_at: order.created_at,
                        address: { label: 'Erbil Delivery Address' },
                      },
                      null,
                      isRtl ? (i18n.language === 'ar' ? 'ar' : 'ku') : 'en'
                    )
                  }
                  className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                  title="WhatsApp Receipt"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {order.status}
                </span>
                <Link
                  to="/marketplace"
                  className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                >
                  Re-order
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official SHAKH Receipt Modal */}
      <OrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={Boolean(selectedReceiptOrder)}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
}
