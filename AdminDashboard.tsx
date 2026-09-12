import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  Activity,
  ClipboardList,
  Bike,
  Store,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Receipt,
} from 'lucide-react';
import CaptainSettlementManager from '../finance/CaptainSettlementManager';
import { useCaptainFinanceStore, getCaptainFinancialSummary } from '../../store/useCaptainFinanceStore';

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  customer_id: string;
  business_id: string;
  captain_id: string | null;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchOrder, setSearchOrder] = useState('');
  const [adminTab, setAdminTab] = useState<'pipeline' | 'settlements'>('pipeline');

  const { captains } = useCaptainFinanceStore();
  const totalFleetCashInHand = captains.reduce((sum, c) => {
    const s = getCaptainFinancialSummary(c);
    return sum + s.remainingCashInHand;
  }, 0);

  const fetchAdminOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as any })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch = o.order_number.toLowerCase().includes(searchOrder.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countByStatus = (status: string) => orders.filter((o) => o.status === status).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Operational Command
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Admin Ops
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Real-time order pipeline monitoring, captain dispatch routing, and vendor fulfillment.
          </p>
        </div>

        <button
          onClick={fetchAdminOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Admin Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              adminTab === 'pipeline'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>هێڵی ئۆردەرەکان (Order Pipeline)</span>
          </button>

          <button
            onClick={() => setAdminTab('settlements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'settlements'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>حیساباتی کاپتنەکان و گەڕاندنەوەی پارە (Captain Cash & Settlements)</span>
            <span className="font-mono px-2 py-0.5 rounded-full text-[11px] bg-white/20 font-extrabold">
              {totalFleetCashInHand.toLocaleString()} IQD
            </span>
          </button>
        </div>
      </div>

      {adminTab === 'settlements' ? (
        <CaptainSettlementManager
          title="حیساباتی پارەی لای کاپتنەکان و تۆمارکردنی گەڕاندنەوە (Admin Captain Cash Hub)"
          showFleetSelector={true}
        />
      ) : (
        <>
          {/* Operational Funnel Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('NEW')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'NEW'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Incoming</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {countByStatus('NEW')}
          </div>
          <span className="text-[11px] text-slate-400">Needs Dispatch</span>
        </div>

        <div 
          onClick={() => setStatusFilter('PREPARING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'PREPARING'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>In Kitchen</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {countByStatus('PREPARING')}
          </div>
          <span className="text-[11px] text-slate-400">Vendor Preparing</span>
        </div>

        <div 
          onClick={() => setStatusFilter('ON_THE_WAY')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'ON_THE_WAY'
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>On Delivery</span>
            <Bike className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {countByStatus('ON_THE_WAY')}
          </div>
          <span className="text-[11px] text-slate-400">In Transit</span>
        </div>

        <div 
          onClick={() => setStatusFilter('DELIVERED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'DELIVERED'
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Fulfilled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {countByStatus('DELIVERED')}
          </div>
          <span className="text-[11px] text-slate-400">Today's Completed</span>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Active Dispatch Queue</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute start-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                placeholder="Search Order #..."
                className="w-full py-1.5 ps-8 pe-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-900 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 text-start">Order Number</th>
                <th className="py-3 px-3 text-start">Current Status</th>
                <th className="py-3 px-3 text-start">Total Amount</th>
                <th className="py-3 px-3 text-start">Dispatch Route</th>
                <th className="py-3 px-3 text-end">Operational Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        #{order.order_number.substring(0, 8)}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : order.status === 'NEW'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {order.total.toLocaleString()} IQD
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[120px]">Partner Store</span>
                        <span>→</span>
                        <Bike className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.captain_id ? 'Assigned' : 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-end">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="py-1 px-2 rounded text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      >
                        <option value="NEW">New</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="ON_THE_WAY">On The Way</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancel Order</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No active orders matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
