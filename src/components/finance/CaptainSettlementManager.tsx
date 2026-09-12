import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bike,
  DollarSign,
  Utensils,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Plus,
  RotateCcw,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
  Wallet,
  TrendingDown,
  Building2,
  BadgePercent
} from 'lucide-react';
import { useCaptainFinanceStore, getCaptainFinancialSummary } from '../../store/useCaptainFinanceStore';
import CaptainCashSettlementModal from './CaptainCashSettlementModal';
import { CaptainFinanceProfile, CaptainOrder } from '../../types/captainFinance';

interface Props {
  embeddedForCaptainId?: string; // If provided, shows just this captain (e.g. inside CaptainDashboard)
  title?: string;
  showFleetSelector?: boolean;
}

export default function CaptainSettlementManager({
  embeddedForCaptainId,
  title,
  showFleetSelector = true,
}: Props) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ku' || i18n.language === 'ar';

  const {
    captains,
    selectedCaptainId,
    setSelectedCaptainId,
    addOrderToCaptain,
    resetToDefault,
  } = useCaptainFinanceStore();

  const activeCaptainId = embeddedForCaptainId || selectedCaptainId;
  const captain = captains.find((c) => c.id === activeCaptainId) || captains[0];
  const summary = getCaptainFinancialSummary(captain);

  const [activeTab, setActiveTab] = useState<'orders' | 'settlements'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'food' | 'market'>('all');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);

  // New Order Form state
  const [newOrderType, setNewOrderType] = useState<'food' | 'market'>('food');
  const [newOrderStore, setNewOrderStore] = useState('');
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderAmount, setNewOrderAmount] = useState<number>(25000);
  const [newOrderDeliveryFee, setNewOrderDeliveryFee] = useState<number>(3500);
  const [newOrderPlatformFee, setNewOrderPlatformFee] = useState<number>(1000);

  const filteredOrders = captain.orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.category === orderFilter;
  });

  const handleCreateOrder = (e: FormEvent) => {
    e.preventDefault();
    const isFood = newOrderType === 'food';
    const captainEarning = Math.max(0, newOrderDeliveryFee - newOrderPlatformFee);
    const totalCash = newOrderAmount + newOrderDeliveryFee;

    addOrderToCaptain(captain.id, {
      orderNumber: `SHAKH-${isFood ? 'FD' : 'MK'}-${Math.floor(100 + Math.random() * 900)}`,
      category: newOrderType,
      categoryLabelKu: isFood ? 'چێشتخانە (Food)' : 'مارکێت (Market)',
      storeName: newOrderStore || (isFood ? 'چێشتخانەی دیوان' : 'کارفوور مارکێت'),
      customerName: newOrderCustomer || 'کڕیاری نوێ',
      deliveryAddress: 'هەولێر، گەڕەکی وەزیران',
      orderAmount: newOrderAmount,
      deliveryFee: newOrderDeliveryFee,
      captainDeliveryFee: captainEarning,
      platformFee: newOrderPlatformFee,
      totalCashCollected: totalCash,
      paymentMethod: 'CASH_ON_DELIVERY',
    });

    setShowAddOrderModal(false);
    setNewOrderStore('');
    setNewOrderCustomer('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Header & Captain Selector */}
      <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {title || 'هەژمارکردنی پارەی پلاتفۆرمی شاخ، کرێی گەیاندن و پارەی ئۆردەر'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                حیسابکردنی ووردی پارەی ئۆردەر (بۆ فرۆشیار)، کرێی گەیاندن (بۆ کاپتن)، و پارەی پلاتفۆرمی شاخ لەگەڵ هێنانە خوارەوە لە کاتی وەرگرتنەوە
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddOrderModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary-600" />
            <span>زیادکردنی ئۆردەر بۆ کاپتن</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettlementModalOpen(true)}
            disabled={summary.remainingCashInHand <= 0}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            <span>وەرگرتنەوە و هێنانە خوارەوە لە لای کاپتن</span>
          </button>

          <button
            type="button"
            title="گەڕاندنەوە بۆ باری سەرەتایی نموونە"
            onClick={resetToDefault}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fleet Captain Picker */}
      {showFleetSelector && !embeddedForCaptainId && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 pe-2">کاپتنی دیاریکراو:</span>
          {captains.map((c) => {
            const isSelected = c.id === activeCaptainId;
            const cSummary = getCaptainFinancialSummary(c);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCaptainId(c.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border shrink-0 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 shadow-xs ring-1 ring-primary-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    کاش: {cSummary.remainingCashInHand.toLocaleString()} IQD
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 4 Core Financial Pillar Cards as Requested by User */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cash In Hand (Brought Down upon settlement) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-2 border-amber-500/40 dark:border-amber-500/30 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5" />
                <span>کۆی کاشی لای کاپتن</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {summary.remainingCashInHand.toLocaleString()}{' '}
                <span className="text-sm font-sans font-bold text-amber-600">IQD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">لە کاتی وەرگرتنەوە:</span>
            <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-amber-600" />
              <span>دەهێنرێتە خوارەوە</span>
            </span>
          </div>
        </div>

        {/* Card 2: SHAKH Platform Fee (پارەی پلاتفۆرمی شاخ) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-500/15 via-primary-500/5 to-transparent border-2 border-primary-500/30 dark:border-primary-500/30 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>پارەی پلاتفۆرمی شاخ</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {summary.totalPlatformFee.toLocaleString()}{' '}
                <span className="text-sm font-sans font-bold text-primary-600">IQD</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-xs">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-primary-500/20 text-[11px] text-slate-500 flex justify-between">
            <span>عمولەی شاخ لە ئۆردەر:</span>
            <span className="font-bold font-mono text-primary-700 dark:text-primary-300">
              {captain.orders.length} ئۆردەر هەژمارکراوە
            </span>
          </div>
        </div>

        {/* Card 3: Delivery Fees & Captain Earnings (کرێی گەیاندن) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Bike className="w-3.5 h-3.5" />
                <span>کرێی گەیاندن (پشکی کاپتن)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                +{summary.totalCaptainDeliveryEarnings.toLocaleString()}{' '}
                <span className="text-xs font-sans text-slate-500 font-normal">IQD</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>کۆی گشتی کرێی گەیاندن:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {summary.totalDeliveryFees.toLocaleString()} IQD
            </span>
          </div>
        </div>

        {/* Card 4: Order Merchandise Amount (پارەی ئۆردەر بۆ فرۆشیار و چێشتخانە و مارکێت) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>پارەی ئۆردەرەکان (کاڵا)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {summary.totalItemAmount.toLocaleString()}{' '}
                <span className="text-xs font-sans text-slate-500 font-normal">IQD</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>بۆ چێشتخانە و مارکێت:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
              چێشتخانە {summary.foodSubtotal.toLocaleString()} | مارکێت {summary.marketSubtotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Accounting Equation Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-850 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-primary-300">
            <Sparkles className="w-4 h-4" />
            <span>هاوکێشەی دروستی حیساباتی کاپتن لای پلاتفۆرمی شاخ</span>
          </div>
          <p className="text-slate-300 text-xs">
            کۆی کاشی وەرگیراو ({summary.totalCashCollected.toLocaleString()} IQD) = 
            پارەی ئۆردەرەکان ({summary.totalItemAmount.toLocaleString()}) + 
            کرێی کاپتن ({summary.totalCaptainDeliveryEarnings.toLocaleString()}) + 
            پارەی پلاتفۆرمی شاخ ({summary.totalPlatformFee.toLocaleString()})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div className="p-2.5 rounded-xl bg-white/10 text-center">
            <span className="text-[10px] text-slate-300 block font-sans">کۆی کاش کۆکراوەتەوە</span>
            <span className="font-bold text-sm text-white">
              {summary.totalCashCollected.toLocaleString()} IQD
            </span>
          </div>

          <div className="text-slate-400 font-bold text-base">-</div>

          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
            <span className="text-[10px] text-emerald-300 block font-sans">وەرگیراوە لە کاپتن</span>
            <span className="font-bold text-sm text-emerald-400">
              {summary.totalReturnedCash.toLocaleString()} IQD
            </span>
          </div>

          <div className="text-slate-400 font-bold text-base">=</div>

          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center">
            <span className="text-[10px] text-amber-300 block font-sans font-bold">ماوە لە لای کاپتن</span>
            <span className="font-black text-sm text-amber-400">
              {summary.remainingCashInHand.toLocaleString()} IQD
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs: Orders Breakdown vs. Settlement History */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>لیستی ئۆردەرەکان و هەژمارکردنیان ({captain.orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'settlements'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>مێژووی وەرگرتنەوە و هێنانە خوارەوە ({captain.settlements.length})</span>
            </button>
          </div>

          {/* Subfilter for Orders */}
          {activeTab === 'orders' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">فلتەر:</span>
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  orderFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                هەموو ({captain.orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('food')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  orderFilter === 'food'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                }`}
              >
                <Utensils className="w-3 h-3" />
                <span>چێشتخانە ({summary.foodOrdersCount})</span>
              </button>
              <button
                onClick={() => setOrderFilter('market')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 ${
                  orderFilter === 'market'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                <span>مارکێت ({summary.marketOrdersCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Orders List with 3 Detailed Financial Columns */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3 text-start">ژمارەی ئۆردەر</th>
                  <th className="py-2.5 px-3 text-start">جۆر و شوێن</th>
                  <th className="py-2.5 px-3 text-start">کڕیار و ناونیشان</th>
                  <th className="py-2.5 px-3 text-start bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                    1. پارەی ئۆردەر (کاڵا)
                  </th>
                  <th className="py-2.5 px-3 text-start bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                    2. کرێی گەیاندن (کاپتن)
                  </th>
                  <th className="py-2.5 px-3 text-start bg-primary-50/40 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300">
                    3. پلاتفۆرمی شاخ
                  </th>
                  <th className="py-2.5 px-3 text-start bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold">
                    کۆی کاش لای کاپتن
                  </th>
                  <th className="py-2.5 px-3 text-start">کات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const captainShare = order.captainDeliveryFee ?? Math.max(0, order.deliveryFee - (order.platformFee || 1000));
                    const platformShare = order.platformFee ?? 1000;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.category === 'food'
                                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {order.categoryLabelKu}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {order.storeName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900 dark:text-white">{order.customerName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{order.deliveryAddress}</span>
                          </div>
                        </td>
                        {/* 1. Order Item Amount */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50/20 dark:bg-blue-950/10">
                          {order.orderAmount.toLocaleString()} IQD
                        </td>
                        {/* 2. Captain Delivery Earnings */}
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10">
                          +{captainShare.toLocaleString()} IQD
                        </td>
                        {/* 3. SHAKH Platform Fee */}
                        <td className="py-3 px-3 font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50/20 dark:bg-primary-950/10">
                          +{platformShare.toLocaleString()} IQD
                        </td>
                        {/* Total Cash in Hand */}
                        <td className="py-3 px-3 font-mono font-extrabold text-slate-900 dark:text-white bg-amber-50/30 dark:bg-amber-950/20">
                          {order.totalCashCollected.toLocaleString()} IQD
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px]">
                          {new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      هیچ ئۆردەرێک لەم پۆلەدا نەدۆزرایەوە.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Settlement History with Balance Deduction Tracking */}
        {activeTab === 'settlements' && (
          <div className="space-y-3">
            {captain.settlements.length > 0 ? (
              captain.settlements.map((stl) => (
                <div
                  key={stl.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded text-xs">
                        #{stl.referenceCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {stl.paymentMethodLabelKu}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(stl.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(stl.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>وەرگیراوە لەلایەن: <strong className="text-slate-700 dark:text-slate-300">{stl.receivedBy}</strong></span>
                      {stl.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-600 dark:text-slate-400">{stl.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-end">
                    <div className="font-mono">
                      <span className="text-[11px] text-slate-400 block">بڕی وەرگیراو لە کاپتن</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                        -{stl.amountReturned.toLocaleString()} IQD
                      </span>
                    </div>

                    <div className="font-mono border-s border-slate-200 dark:border-slate-800 ps-4">
                      <span className="text-[11px] text-slate-400 block">هێنرایە خوارەوە بۆ</span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {stl.newBalance.toLocaleString()} IQD
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 mx-auto opacity-30" />
                <p className="font-medium text-sm">هێشتا هیچ پارەیەک لەلایەن ئەم کاپتنەوە نەگەڕێنراوەتەوە.</p>
                <p className="text-xs text-slate-500">
                  کلیل لەسەر دوگمەی "وەرگرتنەوە و هێنانە خوارەوە لە لای کاپتن" بکە بۆ تۆمارکردنی سێتڵمێنت.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Settlement Modal with Real-Time Deduction */}
      <CaptainCashSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        captain={captain}
        onSuccess={() => {
          setActiveTab('settlements');
        }}
      />

      {/* Add Demo Order Modal with Explicit 3 Fields */}
      {showAddOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                زیادکردنی ئۆردەر بۆ {captain.name}
              </h3>
              <button
                onClick={() => setShowAddOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                داخستن
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">جۆری ئۆردەر:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOrderType('food')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                      newOrderType === 'food'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 ring-1 ring-orange-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>چێشتخانە (Food)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrderType('market')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                      newOrderType === 'market'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>مارکێت (Market)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ناوی فرۆشگا / چێشتخانە:</label>
                <input
                  type="text"
                  placeholder={newOrderType === 'food' ? 'نموونە: چێشتخانەی دیوان' : 'نموونە: کارفوور مارکێت'}
                  value={newOrderStore}
                  onChange={(e) => setNewOrderStore(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ناوی کڕیار:</label>
                <input
                  type="text"
                  placeholder="ناوی کڕیار"
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">1. پارەی کاڵا:</label>
                  <input
                    type="number"
                    step="500"
                    value={newOrderAmount}
                    onChange={(e) => setNewOrderAmount(Number(e.target.value))}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">2. کرێی گەیاندن:</label>
                  <input
                    type="number"
                    step="500"
                    value={newOrderDeliveryFee}
                    onChange={(e) => setNewOrderDeliveryFee(Number(e.target.value))}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">3. پلاتفۆرمی شاخ:</label>
                  <input
                    type="number"
                    step="250"
                    value={newOrderPlatformFee}
                    onChange={(e) => setNewOrderPlatformFee(Number(e.target.value))}
                    className="w-full py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">کرێی دەستی کاپتن:</span>
                  <span className="font-bold text-emerald-600">
                    +{(Math.max(0, newOrderDeliveryFee - newOrderPlatformFee)).toLocaleString()} IQD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">کۆی کاشی وەرگیراو لای کاپتن:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(newOrderAmount + newOrderDeliveryFee).toLocaleString()} IQD
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  داخستن
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold"
                >
                  تۆمارکردنی ئۆردەر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
