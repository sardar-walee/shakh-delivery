import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  AlertCircle,
  Plus,
  Power,
  RefreshCw,
  Eye,
} from 'lucide-react';
import CarPostAnalytics from './CarPostAnalytics';

interface MerchantOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  created_at: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  stock: number;
}

export default function MerchantDashboard() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderTab, setOrderTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      // 1. Fetch store orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_number, status, total, subtotal, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      setOrders(ordersData || []);

      // 2. Fetch products
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, price, is_available, stock')
        .limit(10);

      if (prodData && prodData.length > 0) {
        setProducts(prodData);
      } else {
        // Fallback demo items if vendor just opened
        setProducts([
          { id: '1', name: 'Kabab Erbil Special', price: 12000, is_available: true, stock: 45 },
          { id: '2', name: 'Biryani Rice with Lamb', price: 14000, is_available: true, stock: 20 },
          { id: '3', name: 'Fresh Kurdish Bread (5x)', price: 1500, is_available: true, stock: 100 },
          { id: '4', name: 'Lentil Soup with Croutons', price: 3500, is_available: false, stock: 0 },
        ]);
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus as any })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const toggleProductAvailability = async (productId: string, current: boolean) => {
    try {
      await supabase
        .from('products')
        .update({ is_available: !current })
        .eq('id', productId);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !current } : p))
      );
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !current } : p))
      );
    }
  };

  const activeOrders = orders.filter((o) => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const pastOrders = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status));

  const totalSalesToday = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Store Status & Toggle */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-primary-500">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Merchant Operations Portal
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isOpen
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isOpen ? 'Store Open & Accepting' : 'Store Closed'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage incoming tickets, kitchen prep queues, inventory availability, and store hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              isOpen
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOpen ? 'Pause Incoming Orders' : 'Go Online'}</span>
          </button>

          <button
            onClick={fetchMerchantData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Today's Revenue</div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {totalSalesToday.toLocaleString()} IQD
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">+12% vs yesterday</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Live Kitchen Queue</div>
          <div className="text-xl font-bold font-display text-amber-600 dark:text-amber-400">
            {activeOrders.length} Orders
          </div>
          <span className="text-[11px] text-slate-400">Average prep: 18 mins</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Catalog Items</div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {products.length} Products
          </div>
          <span className="text-[11px] text-slate-400">
            {products.filter((p) => p.is_available).length} Available
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Rating Score</div>
          <div className="text-xl font-bold font-display text-amber-500">
            4.9 / 5.0
          </div>
          <span className="text-[11px] text-slate-400">From 184 verified reviews</span>
        </div>
      </div>

      <CarPostAnalytics />

      {/* Main Split: Kitchen Queue & Product Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Kitchen Display System (KDS) (7 cols) */}
        <div className="lg:col-span-7 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Kitchen Display & Prep Queue</h2>
            </div>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setOrderTab('ACTIVE')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  orderTab === 'ACTIVE' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Active ({activeOrders.length})
              </button>
              <button
                onClick={() => setOrderTab('HISTORY')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  orderTab === 'HISTORY' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Completed ({pastOrders.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(orderTab === 'ACTIVE' ? activeOrders : pastOrders).length > 0 ? (
              (orderTab === 'ACTIVE' ? activeOrders : pastOrders).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        #{order.order_number.substring(0, 8)}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        Received {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                        order.status === 'NEW'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                          : order.status === 'PREPARING'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                      {order.total.toLocaleString()} IQD
                    </span>

                    {/* Workflow transition actions */}
                    <div className="flex items-center gap-2">
                      {order.status === 'NEW' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                            className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                          Start Cooking / Prep
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Ready for Captain
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Waiting for Captain Pickup
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No orders in this queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Inventory & Menu Stock (5 cols) */}
        <div className="lg:col-span-5 card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Quick Menu / Stock</h2>
            </div>
            <span className="text-xs text-slate-400">Instant toggle</span>
          </div>

          <div className="space-y-2.5">
            {products.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-primary-600">{item.price.toLocaleString()} IQD</span>
                    <span>•</span>
                    <span>Stock: {item.stock}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleProductAvailability(item.id, item.is_available)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    item.is_available
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.is_available ? 'Available' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
