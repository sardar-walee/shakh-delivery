import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  Bike,
  Navigation,
  CheckCircle2,
  PhoneCall,
  Clock,
  DollarSign,
  MapPin,
  Store,
  Power,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Receipt,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import CaptainSettlementManager from '../finance/CaptainSettlementManager';
import { useCaptainFinanceStore, getCaptainFinancialSummary } from '../../store/useCaptainFinanceStore';
import { useAuthStore } from '../../store/useAuthStore';

interface DeliveryOrder {
  id: string;
  order_number: string;
  status: string;
  delivery_fee: number;
  total: number;
  created_at: string;
  business?: {
    name: string;
    address: string | null;
  };
}

export default function CaptainDashboard() {
  const { t } = useTranslation();
  const { coordinates, city } = useGeolocation();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'finances' | 'deliveries'>('all');

  const { user } = useAuthStore();
  const { captains, loadCaptains } = useCaptainFinanceStore();
  const captain = captains.find((c) => c.id === user?.id) || captains[0];
  const finance = getCaptainFinancialSummary(captain);

  const fetchCaptainData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available ready orders
      const { data: readyOrders } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          delivery_fee,
          total,
          created_at,
          business:businesses!orders_business_id_fkey(name,address)
        `)
        .in('status', ['READY', 'CAPTAIN_ASSIGNED', 'PICKED_UP'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (readyOrders && readyOrders.length > 0) {
        const enriched = readyOrders.map((o: any) => ({
          ...o,
          delivery_fee: Number(o.delivery_fee || 0),
          business: o.business || { name: '', address: null },
        }));
        const inProgress = enriched.find((o: any) => ['CAPTAIN_ASSIGNED', 'PICKED_UP'].includes(o.status));
        if (inProgress) {
          setActiveDelivery(inProgress);
          setAvailableOrders(enriched.filter((o: any) => o.id !== inProgress.id));
        } else {
          setAvailableOrders(enriched);
        }
      } else {
        setAvailableOrders([]);
        setActiveDelivery(null);
      }
    } catch (err) {
      console.error('Error loading captain jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCaptains();
    void fetchCaptainData();
  }, []);

  const acceptJob = async (order: DeliveryOrder) => {
    try {
      await supabase
        .from('orders')
        .update({ status: 'CAPTAIN_ASSIGNED' as any })
        .eq('id', order.id);

      setActiveDelivery({ ...order, status: 'CAPTAIN_ASSIGNED' });
      setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (error) {
      console.error('Could not accept delivery:', error);
    }
  };

  const updateActiveDeliveryStatus = async (nextStatus: 'PICKED_UP' | 'DELIVERED') => {
    if (!activeDelivery) return;
    try {
      await supabase
        .from('orders')
        .update({ status: nextStatus as any })
        .eq('id', activeDelivery.id);

      if (nextStatus === 'DELIVERED') {
        setActiveDelivery(null);
      } else {
        setActiveDelivery({ ...activeDelivery, status: nextStatus });
      }
    } catch (error) {
      console.error('Could not update delivery:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Courier Duty & Live Location */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-blue-600">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Captain Dispatch Console
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isOnDuty
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`} />
              {isOnDuty ? 'On Duty & Receiving Orders' : 'Off Duty'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span>Active Sector: {city || 'Erbil City Center'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              isOnDuty
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnDuty ? 'Go Off-Duty' : 'Go On-Duty'}</span>
          </button>

          <button
            onClick={fetchCaptainData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode / View Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          هەموو بەشەکان (Overview)
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'finances'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>حیساباتی کاپتن و گەڕاندنەوەی پارە (Cash Settlements)</span>
          <span className="font-mono px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
            {finance.remainingCashInHand.toLocaleString()} IQD
          </span>
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'deliveries'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>ئۆردەرە چالاکەکان و ڕادار (Trips)</span>
        </button>
      </div>

      {/* Highlighted Banner for Captain's Cash Holding (User's Exact Specification) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
              حیساباتی دەستی کاپتن
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {captain.name}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            کاپتن <strong>{finance.foodOrdersCount} ئۆردەری چێشتخانە</strong> ({finance.foodCashCollected.toLocaleString()} IQD) وە <strong>{finance.marketOrdersCount} ئۆردەری مارکێت</strong> ({finance.marketCashCollected.toLocaleString()} IQD) ی لایە.
            کۆی گشتی <strong>{finance.totalOrdersCount} ئۆردەر</strong> گەیەندراوە.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-end font-mono">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold block font-sans">
              کۆی پارەی ئێستای لای کاپتن (کاش):
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {finance.remainingCashInHand.toLocaleString()} <span className="text-xs text-amber-600">IQD</span>
            </span>
          </div>

          <button
            onClick={() => setActiveTab('finances')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Receipt className="w-4 h-4" />
            <span>وردەکاری و گەڕاندنەوە</span>
          </button>
        </div>
      </div>

      {/* View: Finances Tab Only */}
      {activeTab === 'finances' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <CaptainSettlementManager
            embeddedForCaptainId={captain?.id}
            title="حیساباتی کاپتن و گەڕاندنەوەی پارە (Captain Settlements)"
            showFleetSelector={true}
          />
        </div>
      )}

      {/* View: Deliveries or All */}
      {(activeTab === 'all' || activeTab === 'deliveries') && (
        <>
          {/* Today's Courier Earnings */}
          <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Deliveries Made</div>
          <div className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {finance.totalOrdersCount} Trips
          </div>
          <span className="text-[11px] text-slate-400">100% completion rate</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Earned Fares</div>
          <div className="text-xl font-bold font-display text-blue-600 dark:text-blue-400 font-mono">
            {finance.totalCaptainDeliveryEarnings.toLocaleString()} IQD
          </div>
          <span className="text-[11px] text-slate-400">Direct courier payout</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 mb-1 font-medium">Customer Tips</div>
          <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 font-mono">
            +0 IQD
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% goes to you</span>
        </div>
      </div>

      {/* Active Trip in Progress (Priority Hero Card) */}
      {activeDelivery ? (
        <div className="card p-6 border-2 border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Active Delivery in Progress
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                #{activeDelivery.order_number}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-600 text-white uppercase">
              {activeDelivery.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Store Pickup */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Store className="w-4 h-4 text-amber-500" />
                Step 1: Pick Up from Merchant
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {activeDelivery.business?.name || 'Restaurant'}
              </h4>
              <p className="text-xs text-slate-500">
                {activeDelivery.business?.address || 'Empire World, Erbil'}
              </p>
              <div className="pt-2">
                {activeDelivery.status === 'CAPTAIN_ASSIGNED' ? (
                  <button
                    onClick={() => updateActiveDeliveryStatus('PICKED_UP')}
                    className="w-full py-2 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Confirm Order Picked Up
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Picked up from vendor
                  </span>
                )}
              </div>
            </div>

            {/* Customer Dropoff */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                <Navigation className="w-4 h-4 text-emerald-500" />
                Step 2: Deliver to Customer
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Customer Delivery Destination
              </h4>
              <p className="text-xs text-slate-500">
                Bakhtiyari District, Villa 42, Erbil
              </p>
              <div className="flex gap-2 pt-2">
                <a
                  href="tel:+9647501234567"
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-primary-600" />
                  Call Customer
                </a>

                <button
                  disabled={activeDelivery.status !== 'PICKED_UP'}
                  onClick={() => updateActiveDeliveryStatus('DELIVERED')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                    activeDelivery.status === 'PICKED_UP'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                  }`}
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Available Jobs to Claim */}
      <div className="card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Available Delivery Pool Nearby
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {availableOrders.length} Ready Pickups
          </span>
        </div>

        <div className="space-y-3">
          {availableOrders.length > 0 ? (
            availableOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      #{order.order_number.substring(0, 8)}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Fare: {order.delivery_fee.toLocaleString()} IQD
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.business?.name}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.business?.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => acceptJob(order)}
                  disabled={Boolean(activeDelivery)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    activeDelivery
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {activeDelivery ? 'Finish Active Job First' : 'Accept Delivery (+4,500 IQD)'}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400">
              <Bike className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No open deliveries in your radius right now.</p>
              <p className="text-xs text-slate-500 mt-1">Orders will appear here as soon as stores finish prep.</p>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Show Settlement Manager in 'all' view as well */}
      {activeTab === 'all' && (
        <div className="pt-2">
          <CaptainSettlementManager
            embeddedForCaptainId={captain?.id}
            title="حیساباتی کاپتن و پاکتاوکردنی کاش (Captain Daily Settlements)"
            showFleetSelector={true}
          />
        </div>
      )}
    </div>
  );
}
