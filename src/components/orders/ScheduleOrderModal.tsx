import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Bike,
  Store,
  MapPin,
  Phone,
  User,
  AlertCircle,
  X,
  ShoppingBag,
  Utensils,
  MessageSquare,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import {
  useScheduledOrderStore,
  DEFAULT_CAPTAINS,
} from '../../store/useScheduledOrderStore';
import { ScheduledOrderCategory } from '../../types/order';

interface ScheduleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ScheduledOrderCategory | null;
}

export default function ScheduleOrderModal({
  isOpen,
  onClose,
  defaultCategory,
}: ScheduleOrderModalProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language !== 'en';
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { items, clearCart } = useCartStore();
  const { createScheduledOrder, generateCaptainWhatsAppDispatchText } = useScheduledOrderStore();

  // Mode: Instant (ASAP) or Scheduled (Future Date & Time)
  const [deliveryMode, setDeliveryMode] = useState<'scheduled' | 'instant'>('scheduled');

  // Detect category from cart or default
  const detectedCategory = useMemo<ScheduledOrderCategory>(() => {
    if (defaultCategory) return defaultCategory;
    if (items.length > 0) {
      const hasFood = items.some((i) =>
        (i.category || '').toLowerCase().includes('food') ||
        (i.category || '').toLowerCase().includes('restaurant') ||
        (i.name || '').toLowerCase().includes('burger') ||
        (i.name || '').toLowerCase().includes('pizza') ||
        (i.name_ku || '').includes('بەرگەر') ||
        (i.name_ku || '').includes('خواردن')
      );
      if (hasFood) return 'food';
    }
    return 'market';
  }, [items, defaultCategory]);

  const [category, setCategory] = useState<ScheduledOrderCategory>(detectedCategory);

  // Future Date Calculation Helpers
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const dayAfterTomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('13:30');
  const [customTime, setCustomTime] = useState<string>('13:30');
  const [isCustomTimeMode, setIsCustomTimeMode] = useState<boolean>(false);

  // Assigned Captain
  const [selectedCaptainId, setSelectedCaptainId] = useState<string>(DEFAULT_CAPTAINS[0].id);
  const assignedCaptain = useMemo(
    () => DEFAULT_CAPTAINS.find((c) => c.id === selectedCaptainId) || DEFAULT_CAPTAINS[0],
    [selectedCaptainId]
  );

  // Customer Contact & Address Info
  const [customerName, setCustomerName] = useState<string>(
    user?.email?.split('@')[0] || 'سەردار خانۆ (Sardar Xano)'
  );
  const [customerPhone, setCustomerPhone] = useState<string>('0750 444 8899');
  const [district, setDistrict] = useState<string>('بەختیاری (Bakhtiyari)');
  const [street, setStreet] = useState<string>('شەقامی سەرەکی، تاوەری بەختیاری');
  const [building, setBuilding] = useState<string>('نهۆمی ٤، شوقەی ١٢');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'FIB' | 'FASTPAY'>('CASH_ON_DELIVERY');

  if (!isOpen) return null;

  // Preset Time Slots
  const timeSlots = [
    {
      time: '12:30',
      labelKu: '12:30 پ.ن (نیوەڕۆ / Lunch)',
      labelEn: '12:30 PM (Lunch)',
      icon: '🍽️',
    },
    {
      time: '13:30',
      labelKu: '01:30 پ.ن (پاش نیوەڕۆ / Peak)',
      labelEn: '01:30 PM (Peak)',
      icon: '🍲',
    },
    {
      time: '16:00',
      labelKu: '04:00 ئێوارە (عەسرانە / Afternoon)',
      labelEn: '04:00 PM (Afternoon)',
      icon: '☕',
    },
    {
      time: '19:00',
      labelKu: '07:00 ئێوارە (شوانە / Dinner)',
      labelEn: '07:00 PM (Dinner)',
      icon: '🌙',
    },
    {
      time: '21:00',
      labelKu: '09:00 شەو (درەنگ / Evening)',
      labelEn: '09:00 PM (Late)',
      icon: '🍔',
    },
  ];

  // Quick Date Pills
  const dateOptions = [
    {
      value: todayStr,
      labelKu: 'ئەمڕۆ (Today)',
      subKu: 'کاتژمێرەکانی دواتر',
    },
    {
      value: tomorrowStr,
      labelKu: 'سبەی (Tomorrow)',
      subKu: 'پێشنیارکراو',
    },
    {
      value: dayAfterTomorrowStr,
      labelKu: 'دوو ڕۆژی تر',
      subKu: 'بەرواری داهاتوو',
    },
  ];

  // Calculate Subtotal & Fees
  // Fallback items if cart is opened empty from another route
  const effectiveItems =
    items.length > 0
      ? items
      : [
          {
            id: 'sample-1',
            name: category === 'food' ? 'کۆمبۆ بەرگەری شاهانە لەگەڵ پەتاتە' : 'سەبەتەی پێداویستی خواردەمەنی مارکێت',
            name_ku: category === 'food' ? 'کۆمبۆ بەرگەری شاهانە لەگەڵ پەتاتە' : 'سەبەتەی پێداویستی خواردەمەنی مارکێت',
            price: category === 'food' ? 18500 : 26000,
            quantity: 1,
            image:
              category === 'food'
                ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'
                : 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200',
          },
        ];

  const subtotal = effectiveItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 3000;
  const grandTotal = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    const finalTime = isCustomTimeMode ? customTime : selectedTimeSlot;
    const currentSlotObj = timeSlots.find((s) => s.time === finalTime);
    const slotLabel = currentSlotObj
      ? isRtl
        ? currentSlotObj.labelKu
        : currentSlotObj.labelEn
      : `${finalTime} (دیاریکراو)`;

    const storeName =
      effectiveItems[0]?.storeName ||
      (category === 'food' ? 'چێشتخانەی شاخ (Burger Lab & Grills)' : 'مارکێتی سەرەکی شاخ (Family Market)');

    const newScheduledOrder = createScheduledOrder({
      items: effectiveItems,
      scheduledDate: deliveryMode === 'scheduled' ? selectedDate : todayStr,
      scheduledTime: deliveryMode === 'scheduled' ? finalTime : 'دەستبەجێ (ASAP)',
      scheduledSlotLabel: deliveryMode === 'scheduled' ? slotLabel : 'دەستبەجێ (Instant ASAP)',
      category,
      address: {
        city: 'هەولێر (Erbil)',
        district,
        street,
        building,
        phone: customerPhone,
        notes: orderNotes,
      },
      customerName,
      customerPhone,
      notes: orderNotes,
      storeName,
      preferredCaptainId: selectedCaptainId,
      paymentMethod,
    });

    // Clear user cart if items were present
    if (items.length > 0) {
      clearCart(false);
    }

    toast.success(
      isRtl
        ? `داواکارییە بەروارکراوەکەت بۆ #${newScheduledOrder.order_number} بە سەرکەوتوویی تۆمارکرا و ئاگاداری ڕاستەوخۆ بۆ ${assignedCaptain.name} نێردرا!`
        : `Order #${newScheduledOrder.order_number} scheduled successfully! Captain ${assignedCaptain.name} has been notified.`
    );

    onClose();
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header with Title & Close */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600/30 border border-primary-400/40 flex items-center justify-center shadow-inner text-primary-300">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {isRtl ? 'خشتەدانانی داواکاری بۆ داهاتوو' : 'Schedule Order for Later'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isRtl ? 'ئۆتۆماتیک' : 'Auto'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isRtl
                  ? 'دیاریکردنی بەروار و کاتی گەیاندنی چێشتخانە یان مارکێت بە ئاگادارکردنەوەی کاپتن'
                  : 'Schedule food and market deliveries with automated captain dispatch'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Category Switcher (Food vs Market) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isRtl ? 'جۆری داواکاری (پۆلێنکردن):' : 'Order Category:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('food')}
                className={`p-3.5 rounded-2xl border-2 text-start flex items-center gap-3 transition-all ${
                  category === 'food'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    category === 'food' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {isRtl ? 'چێشتخانە و خواردن (Food)' : 'Food & Restaurant'}
                  </h4>
                  <p className="text-[11px] opacity-75">
                    {isRtl ? 'ئامادەکردنی گەرم و فرێش پێش کاتژمێری دیاریکراو' : 'Freshly prepared before delivery'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('market')}
                className={`p-3.5 rounded-2xl border-2 text-start flex items-center gap-3 transition-all ${
                  category === 'market'
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    category === 'market'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">
                    {isRtl ? 'مارکێت و سوپەرمارکێت (Market)' : 'Market & Groceries'}
                  </h4>
                  <p className="text-[11px] opacity-75">
                    {isRtl ? 'کۆکردنەوەی میوە، سەوزە و پێداویستی ماڵ' : 'Groceries and household items'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Mode: Instant vs Scheduled */}
          <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDeliveryMode('scheduled')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                deliveryMode === 'scheduled'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>{isRtl ? '📅 دیاریکردنی کات و بەروار (خشتەکردن)' : '📅 Schedule for Future Date/Time'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMode('instant')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                deliveryMode === 'instant'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? '⚡ گەیاندنی دەستبەجێ (Now / ASAP)' : '⚡ Deliver Immediately (ASAP)'}</span>
            </button>
          </div>

          {/* 3. Date & Time Selection (When deliveryMode === 'scheduled') */}
          {deliveryMode === 'scheduled' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span>{isRtl ? 'هەڵبژاردنی بەرواری گەیاندن:' : 'Select Delivery Date:'}</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDate(opt.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedDate === opt.value
                          ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.labelKu}</div>
                      <div className={`text-[10px] mt-0.5 ${selectedDate === opt.value ? 'text-primary-100' : 'text-slate-400'}`}>
                        {opt.value}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Date Picker */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {isRtl ? 'یان بەروارێکی دیاری تر:' : 'Or custom date:'}
                  </span>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{isRtl ? 'هەڵبژاردنی کاتی گەیاندن:' : 'Select Delivery Time Slot:'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomTimeMode(!isCustomTimeMode)}
                    className="text-[11px] text-primary-600 hover:underline font-normal"
                  >
                    {isCustomTimeMode
                      ? isRtl
                        ? 'گەڕانەوە بۆ کاتە پێشنیارکراوەکان'
                        : 'Use Preset Slots'
                      : isRtl
                      ? 'دیاریکردنی کاتی تایبەت'
                      : 'Custom Time'}
                  </button>
                </label>

                {!isCustomTimeMode ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl border text-start flex items-center gap-2 transition-all ${
                          selectedTimeSlot === slot.time
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base">{slot.icon}</span>
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-xs block">{slot.time}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {isRtl ? slot.labelKu.split('(')[1]?.replace(')', '') : slot.labelEn}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block">
                        {isRtl ? 'کاتی دروستی گەیاندن دیاری بکە (سەعات:خولەک)' : 'Specify delivery time (HH:MM)'}
                      </label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full py-1 text-sm font-mono font-bold text-slate-800 dark:text-white bg-transparent outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Timing advisory notice */}
                <div className="mt-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    {category === 'food'
                      ? isRtl
                        ? 'سیستەم ٣٠ خولەک بەر لە کاتی دیاریکراو ئۆردەرەکە دەنێرێتە چێشتخانە بۆ ئامادەکردن بۆ ئەوەی خواردنەکەت بە گەرمی و فرێشی بگاتە دەستت.'
                        : 'The system sends preparation dispatch 30 minutes in advance so your meal arrives hot and fresh.'
                      : isRtl
                      ? 'کاپتنی پەیوەندیدار پێش کاتی دیاریکراو کاڵاکانی مارکێت دەپشکنێت و دەگەیەنێتە بەردەم ماڵەکەت.'
                      : 'The assigned captain reviews and picks up grocery items right on schedule.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Automated Captain Assignment & Notification Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-amber-600" />
                  <span>{isRtl ? 'کاپتنی دیاریکراو و ناردنی ئاگاداری ئۆتۆماتیکی' : 'Assigned Captain & Automated Alert'}</span>
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {isRtl ? 'ئاگاداری ڕاستەوخۆ' : 'Instant Dispatch'}
              </span>
            </div>

            {/* Captain Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {DEFAULT_CAPTAINS.map((capt) => (
                <div
                  key={capt.id}
                  onClick={() => setSelectedCaptainId(capt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    selectedCaptainId === capt.id
                      ? 'border-amber-500 bg-white dark:bg-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={capt.avatar}
                    alt={capt.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {capt.name.split('(')[0]}
                    </h5>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                      <span>★ {capt.rating}</span>
                      <span>•</span>
                      <span>{capt.vehiclePlate}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {isRtl ? (
                <>
                  بە پشتڕاستکردنەوە، سیستەمی شاخ <strong>ئاگاداری دەستبەجێ (Push Alert + SMS + Notification)</strong> بۆ کاپتن <strong>{assignedCaptain.name}</strong> دەنێرێت تاوەکو لە کاتی خشتەکراودا وەرگرتن و گەیاندن جێبەجێ بکات.
                </>
              ) : (
                <>
                  Upon confirmation, SHAKH dispatches an <strong>automated push alert</strong> to captain <strong>{assignedCaptain.name}</strong> with date, time, and full route details.
                </>
              )}
            </p>
          </div>

          {/* 5. Delivery Address & Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>{isRtl ? 'ناونیشانی وەرگرتن و پەیوەندی کڕیار' : 'Customer Delivery Address'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {isRtl ? 'ناوی وەرگر:' : 'Customer Name:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full py-2 px-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {isRtl ? 'ژمارەی مۆبایل بۆ پەیوەندی کاپتن:' : 'Phone Number for Captain:'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full py-2 px-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {isRtl ? 'گەڕەک / ناوچە:' : 'District:'}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  {isRtl ? 'شەقام و نیشانەی دیاریکراو:' : 'Street & Landmark:'}
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {isRtl ? 'تێبینی بۆ کاپتن یان فرۆشگا (ئارەزوومەندانە):' : 'Special Instructions / Notes:'}
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={
                  isRtl
                    ? 'بۆ نموونە: تکایە لە دەرگای ٢ـەوە وەرنەژوورەوە، یان سۆسی زیادەی لەگەڵ بێت...'
                    : 'E.g., Please buzz apartment 12, or bring extra napkins...'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* 6. Order Items & Price Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isRtl ? 'کاڵاکانی داواکاری:' : 'Order Items:'}
              </span>
              <span className="text-slate-400">
                {effectiveItems.length} {isRtl ? 'کاڵا' : 'items'}
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {effectiveItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-800 dark:text-white block truncate">
                        {item.name_ku || item.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.quantity}x • {item.price.toLocaleString()} IQD
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                    {(item.price * item.quantity).toLocaleString()} IQD
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{isRtl ? 'کۆی کاڵاکان:' : 'Subtotal:'}</span>
                <span className="font-mono">{subtotal.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{isRtl ? 'کرێی گەیاندنی کاپتن:' : 'Delivery Fee:'}</span>
                <span className="font-mono">{deliveryFee.toLocaleString()} IQD</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1">
                <span>{isRtl ? 'کۆی گشتی کاش لە کاتی وەرگرتن:' : 'Total COD Amount:'}</span>
                <span className="font-mono text-primary-600 dark:text-primary-400 text-base">
                  {grandTotal.toLocaleString()} IQD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {isRtl
                ? 'کاپتن ئاگاداری ڕاستەوخۆ وەردەگرێت و کاتی گەیاندن گەرەنتییە'
                : 'Guaranteed timely captain dispatch with automated notification'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isRtl ? 'پاشگەزبوونەوە' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmOrder}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>
                {deliveryMode === 'scheduled'
                  ? isRtl
                    ? 'پشتڕاستکردنەوە و ئاگادارکردنی کاپتن'
                    : 'Confirm & Notify Captain'
                  : isRtl
                  ? 'داواکاری دەستبەجێ'
                  : 'Order Now'}
              </span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
