import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { dispatchNotification } from '../../lib/notifications';
import { TrackedOrder, OrderStatus, CaptainInfo } from '../../types/order';
import OrderTrackingMap from './OrderTrackingMap';
import OrderReceiptModal from './OrderReceiptModal';
import { sendReceiptViaWhatsApp } from '../../utils/whatsappReceipt';
import { isValidUUID } from '../../utils/uuid';
import {
  CheckCircle2,
  Clock,
  Navigation,
  Package,
  Store,
  Bike,
  Phone,
  MessageSquare,
  MapPin,
  Sparkles,
  AlertCircle,
  Receipt,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Share2,
  ShieldCheck,
  Zap,
  Play,
  Car,
} from 'lucide-react';

interface OrderTrackingVisualizerProps {
  initialOrder: TrackedOrder;
  onClose?: () => void;
  showControls?: boolean;
}

interface StepConfig {
  key: OrderStatus;
  labelKu: string;
  labelAr: string;
  labelEn: string;
  descKu: string;
  descAr: string;
  descEn: string;
  icon: any;
  color: string;
}

const TRACKING_STEPS: StepConfig[] = [
  {
    key: 'NEW',
    labelKu: 'داواکاری تۆمارکرا',
    labelAr: 'تم استلام الطلب',
    labelEn: 'Order Placed',
    descKu: 'داواکاریەکەت گەیشتە سیستەم و چاوەڕوانی وەرگرتنە لە فرۆشگا',
    descAr: 'تم إرسال طلبك وبانتظار تأكيد المتجر',
    descEn: 'Order received and sent to the merchant for confirmation',
    icon: Clock,
    color: 'text-blue-500 bg-blue-500',
  },
  {
    key: 'ACCEPTED',
    labelKu: 'پەسەندکرا لە فرۆشگا',
    labelAr: 'تم قبول الطلب',
    labelEn: 'Store Confirmed',
    descKu: 'فرۆشگا داواکاریەکەی پەسەند کرد و نێردرا بۆ ژووری ئامادەکردن',
    descAr: 'المتجر وافق على الطلب وبدأ التجهيز',
    descEn: 'Merchant verified items and confirmed the order',
    icon: Store,
    color: 'text-indigo-500 bg-indigo-500',
  },
  {
    key: 'PREPARING',
    labelKu: 'لە ئامادەکردندایە',
    labelAr: 'جاري التحضير',
    labelEn: 'Preparing Order',
    descKu: 'خواردن یان کاڵاکانت ئێستا بە گەرمی و وردی ئامادە دەکرێن',
    descAr: 'يتم الآن تجهيز طلبك وتغليفه بعناية',
    descEn: 'Your items are being freshly prepared and packed',
    icon: Package,
    color: 'text-amber-500 bg-amber-500',
  },
  {
    key: 'READY',
    labelKu: 'داواکاری ئامادەیە',
    labelAr: 'الطلب جاهز',
    labelEn: 'Ready for Pickup',
    descKu: 'بستە ئامادەیە و لە چاوەڕوانی کاپتندایە بۆ وەرگرتن',
    descAr: 'الطلب مكتمل وجاهز للتسليم للكابتن',
    descEn: 'Order is packed and ready for captain pickup',
    icon: Sparkles,
    color: 'text-orange-500 bg-orange-500',
  },
  {
    key: 'CAPTAIN_ASSIGNED',
    labelKu: 'کاپتن دیاریکرا',
    labelAr: 'تم تعيين الكابتن',
    labelEn: 'Captain Assigned',
    descKu: 'کاپتنی گەیاندن نزیک دەبێتەوە لە فرۆشگا بۆ وەرگرتنی داواکاریەکەت',
    descAr: 'الكابتن في طريقه للمتجر لاستلام الطلب',
    descEn: 'Delivery captain is heading to the store for pickup',
    icon: Bike,
    color: 'text-purple-500 bg-purple-500',
  },
  {
    key: 'ON_THE_WAY',
    labelKu: 'کاپتن بەڕێوەیە بەرەو تۆ',
    labelAr: 'الطلب في الطريق إليك',
    labelEn: 'Out for Delivery',
    descKu: 'کاپتن داواکاریەکەی وەرگرت و ئێستا بەڕێوەیە بەرەو ناونیشانەکەت',
    descAr: 'الكابتن استلم الطلب وهو في الطريق إلى موقعك الآن',
    descEn: 'Captain picked up your order and is en route to your pin',
    icon: Navigation,
    color: 'text-teal-500 bg-teal-500',
  },
  {
    key: 'DELIVERED',
    labelKu: 'داواکاری گەیشت',
    labelAr: 'تم التوصيل بنجاح',
    labelEn: 'Delivered',
    descKu: 'داواکاریەکە بە سەلامەتی گەیشتە دەستت! نۆشی گیانت بێت',
    descAr: 'تم تسليم الطلب بنجاح. بالعافية!',
    descEn: 'Order successfully delivered to your location. Enjoy!',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-500',
  },
];

const ORDER_ORDERED_KEYS: OrderStatus[] = [
  'NEW',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'CAPTAIN_ASSIGNED',
  'ON_THE_WAY',
  'DELIVERED',
];

export default function OrderTrackingVisualizer({
  initialOrder,
  onClose,
  showControls = true,
}: OrderTrackingVisualizerProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const [order, setOrder] = useState<TrackedOrder>(initialOrder);
  const [copied, setCopied] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [captainLivePos, setCaptainLivePos] = useState<{ lat: number; lng: number } | undefined>();
  const [simEtaMinutes, setSimEtaMinutes] = useState<number>(
    initialOrder.estimated_delivery_minutes || 25
  );

  // Sync with initial order if prop changes
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Real-time Supabase Subscription for this order
  useEffect(() => {
    if (!order?.id) return;

    // 1. Subscribe to changes on the specific order in PostgreSQL
    const orderChannel = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload: any) => {
          if (payload.new) {
            const updated = payload.new as TrackedOrder;
            setOrder((prev) => ({
              ...prev,
              ...updated,
              // Maintain nested captain/business if present
              captain: prev.captain,
              business: prev.business,
              items: prev.items,
            }));

            // Dispatch in-app toast notification
            const step = TRACKING_STEPS.find((s) => s.key === updated.status);
            const stepTitle =
              currentLang === 'ku'
                ? step?.labelKu
                : currentLang === 'ar'
                ? step?.labelAr
                : step?.labelEn;

            dispatchNotification({
              title: `نوێکاری داواکاری #${updated.order_number.substring(0, 8)}`,
              body: stepTitle || `باری داواکاری گۆڕدرا بۆ: ${updated.status}`,
              data: { orderId: updated.id, status: updated.status },
            });
          }
        }
      )
      .subscribe();

    // 2. Subscribe to live captain coordinates broadcast
    const captainId = order.captain_id || order.captain?.id;
    let captainChannel: any = null;

    if (captainId) {
      captainChannel = supabase
        .channel(`captain-gps-${captainId}`)
        .on('broadcast', { event: 'location_update' }, (payload) => {
          if (payload?.payload?.lat && payload?.payload?.lng) {
            setCaptainLivePos({
              lat: payload.payload.lat,
              lng: payload.payload.lng,
            });
          }
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(orderChannel);
      if (captainChannel) supabase.removeChannel(captainChannel);
    };
  }, [order.id, order.captain_id, order.captain?.id, currentLang]);

  // Current Step Index
  const currentStepIndex = useMemo(() => {
    if (order.status === 'CANCELLED') return -1;
    if (order.status === 'PICKED_UP') return ORDER_ORDERED_KEYS.indexOf('ON_THE_WAY');
    if (order.status === 'CONFIRMED') return ORDER_ORDERED_KEYS.indexOf('ACCEPTED');
    const idx = ORDER_ORDERED_KEYS.indexOf(order.status);
    return idx >= 0 ? idx : 0;
  }, [order.status]);

  // Progress percentage (0 to 100%)
  const progressPercentage = useMemo(() => {
    if (order.status === 'CANCELLED') return 0;
    if (order.status === 'DELIVERED') return 100;
    return Math.min(100, Math.round((currentStepIndex / (ORDER_ORDERED_KEYS.length - 1)) * 100));
  }, [currentStepIndex, order.status]);

  const captain = order.captain || null;
  const business = order.business || null;

  const customerAddress = {
    lat: order.latitude,
    lng: order.longitude,
    label:
      typeof order.address === 'string'
        ? order.address
        : order.address?.street || order.address?.district || 'Bakhtiyari, Erbil',
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* HEADER CARD: Order Number & Live Pulsing Badge */}
      <div className="card p-5 md:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 end-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping"></span>
                <span>{isRtl ? 'بەدواداچوونی ڕاستەوخۆ' : 'Supabase Realtime Live'}</span>
              </span>
              <span className="text-xs text-slate-400">
                {new Date(order.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>#{order.order_number.substring(0, 8)}</span>
                <button
                  onClick={handleCopyOrderNumber}
                  title="Copy Order ID"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {business?.name || '—'} • {order.total.toLocaleString()} IQD
            </p>
          </div>

          {/* ETA Live Countdown Widget */}
          <div className="flex items-center gap-3">
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[130px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-primary-400 animate-spin" />
                  <span>{isRtl ? 'کاتی گەیشتن (ETA)' : 'Estimated Arrival'}</span>
                </div>
                <div className="text-2xl font-extrabold font-display text-primary-400 mt-0.5">
                  ~{simEtaMinutes} <span className="text-xs font-normal text-white">{isRtl ? 'خولەک' : 'mins'}</span>
                </div>
              </div>
            )}

            {order.status === 'DELIVERED' && (
              <div className="px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{isRtl ? 'گەیشتووە بە سەرکەوتوویی' : 'Delivered Successfully'}</span>
              </div>
            )}

            {order.status === 'CANCELLED' && (
              <div className="px-4 py-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>{isRtl ? 'داواکاری هەڵوەشاوەتەوە' : 'Order Cancelled'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-slate-300">
              {currentLang === 'ku'
                ? TRACKING_STEPS[currentStepIndex]?.labelKu
                : currentLang === 'ar'
                ? TRACKING_STEPS[currentStepIndex]?.labelAr
                : TRACKING_STEPS[currentStepIndex]?.labelEn}
            </span>
            <span className="text-primary-400 font-mono">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700/80 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* INTERACTIVE TIMELINE / STEPPER VISUALIZER */}
      <div className="card p-5 md:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isRtl ? 'قۆناغەکانی گەیاندنی داواکاری' : 'Order Lifecycle Progress'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isRtl ? 'نوێکردنەوەی ڕاستەوخۆ' : 'Real-time Supabase Sync'}
          </span>
        </div>

        <div className="relative">
          {/* Vertical Track for Mobile / Responsive */}
          <div className="space-y-4">
            {TRACKING_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;
              const Icon = step.icon;

              const title =
                currentLang === 'ku'
                  ? step.labelKu
                  : currentLang === 'ar'
                  ? step.labelAr
                  : step.labelEn;

              const desc =
                currentLang === 'ku'
                  ? step.descKu
                  : currentLang === 'ar'
                  ? step.descAr
                  : step.descEn;

              return (
                <div
                  key={step.key}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-primary-50/80 dark:bg-primary-950/40 border-2 border-primary-500 shadow-sm'
                      : isPast
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80'
                      : 'opacity-40 border border-transparent'
                  }`}
                >
                  {/* Step Icon / Circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      isCurrent
                        ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-500/20 scale-105'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-primary-700 dark:text-primary-300'
                            : isPast
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {title}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-primary-600 text-white animate-pulse">
                          {isRtl ? 'ئێستا' : 'Active'}
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{isRtl ? 'تەواو بوو' : 'Completed'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE MAP TRACKING VIEW */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isRtl ? 'نەخشەی زیندوو و ڕێڕەوی کاپتن' : 'Live Captain Map Tracking'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {business?.name || '—'} ➔ {customerAddress.label}
          </span>
        </div>

        <OrderTrackingMap
          storeLocation={{
            lat: business.latitude || 36.1912,
            lng: business.longitude || 44.0092,
            name: business.name,
          }}
          customerLocation={{
            lat: customerAddress.lat,
            lng: customerAddress.lng,
            label: customerAddress.label,
          }}
          captainLocation={captainLivePos}
          status={order.status}
          isRtl={isRtl}
        />
      </div>

      {/* CAPTAIN & STORE CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Captain Profile Card */}
        <div className="card p-4 md:p-5 flex items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={captain.avatar}
                alt={captain.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-primary-500 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-primary-600 text-white rounded-full">
                <Bike className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isRtl ? 'کاپتنی گەیاندن' : 'Delivery Captain'}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{captain.name}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="text-amber-500 font-bold">★ {captain.rating}</span>
                <span>•</span>
                <span>{captain.vehiclePlate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${captain.phone}`}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors shadow-xs"
              title="Call Captain"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() =>
                dispatchNotification({
                  title: `پەیام بۆ کاپتن`,
                  body: `کاپتن ئاگادارکرایەوە لە شوێنی تۆ`,
                })
              }
              className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors shadow-xs"
              title="Message Captain"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Store & Destination Details */}
        <div className="card p-4 md:p-5 flex items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Store className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isRtl ? 'فرۆشگای داواکراو' : 'Merchant Store'}
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{business.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{business.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendReceiptViaWhatsApp(order, business.phone, currentLang)}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-xs"
              title="WhatsApp Store Receipt"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <a
              href={`tel:${business.phone}`}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors shadow-xs"
              title="Call Store"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* RECEIPT ACCORDION & WHATSAPP DISPATCH */}
      <div className="card p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="w-full p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {isRtl ? 'وردەکاری داواکاری و پسوولەی پارەدان' : 'Order Receipt & Price Breakdown'}
              </h4>
              <p className="text-xs text-slate-500">
                {order.payment_status} • Total {order.total.toLocaleString()} IQD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{isRtl ? 'وەسلی شاخ و وەتسئاپ' : 'SHAKH Receipt & WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={() => sendReceiptViaWhatsApp(order, business.phone, currentLang)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isRtl ? 'وەتسئاپ' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={() => setIsReceiptOpen(!isReceiptOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {isReceiptOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isReceiptOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
            >
              {/* Delivery Address */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isRtl ? 'ناونیشانی گەیاندن' : 'Delivery Address'}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 ps-5">
                  {customerAddress.label}
                  {order.notes && <div className="text-[11px] text-amber-600 mt-0.5">Note: {order.notes}</div>}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isRtl ? 'کۆی کاڵاکان' : 'Subtotal'}</span>
                  <span className="font-mono">{(order.subtotal || order.total - 3000).toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{isRtl ? 'کرێی گەیاندن' : 'Delivery Fee'}</span>
                  <span className="font-mono">{(order.delivery_fee || 3000).toLocaleString()} IQD</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>{isRtl ? 'داشکاندن' : 'Discount'}</span>
                    <span className="font-mono">-{order.discount.toLocaleString()} IQD</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>{isRtl ? 'کۆی گشتی' : 'Total Amount'}</span>
                  <span className="font-mono text-primary-600 dark:text-primary-400">{order.total.toLocaleString()} IQD</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Official SHAKH Order Receipt & WhatsApp Modal */}
      <OrderReceiptModal
        order={order}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
