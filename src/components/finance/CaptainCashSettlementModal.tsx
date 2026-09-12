import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  CheckCircle2,
  DollarSign,
  Receipt,
  Share2,
  Printer,
  CreditCard,
  Building2,
  Smartphone,
  TrendingDown,
  ShieldCheck,
  Bike,
  ShoppingBag,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { CaptainFinanceProfile, SettlementRecord } from '../../types/captainFinance';
import { useCaptainFinanceStore, getCaptainFinancialSummary } from '../../store/useCaptainFinanceStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  captain: CaptainFinanceProfile;
  onSuccess?: (settlement: SettlementRecord) => void;
}

export default function CaptainCashSettlementModal({ isOpen, onClose, captain, onSuccess }: Props) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ku' || i18n.language === 'ar';
  const { recordSettlement } = useCaptainFinanceStore();

  const summary = getCaptainFinancialSummary(captain);

  const [returnAmount, setReturnAmount] = useState<number>(summary.remainingCashInHand);
  const [paymentMethod, setPaymentMethod] = useState<'CASH_OFFICE' | 'FASTPAY' | 'FIB' | 'ZAIN_CASH' | 'BANK_TRANSFER'>('CASH_OFFICE');
  const [receivedBy, setReceivedBy] = useState<string>('بەڕێوەبەری دارایی (سەردار خانۆ)');
  const [notes, setNotes] = useState<string>('');
  const [createdSettlement, setCreatedSettlement] = useState<SettlementRecord | null>(null);

  if (!isOpen) return null;

  const handleQuickSelect = (type: 'full' | 'platform' | 'order' | 'company' | 'half') => {
    if (type === 'full') {
      setReturnAmount(summary.remainingCashInHand);
    } else if (type === 'platform') {
      setReturnAmount(Math.min(summary.remainingCashInHand, summary.totalPlatformFee));
    } else if (type === 'order') {
      setReturnAmount(Math.min(summary.remainingCashInHand, summary.totalItemAmount));
    } else if (type === 'company') {
      const companyDue = summary.totalItemAmount + summary.totalPlatformFee;
      setReturnAmount(Math.min(summary.remainingCashInHand, companyDue));
    } else if (type === 'half') {
      setReturnAmount(Math.floor(summary.remainingCashInHand / 2));
    }
  };

  const newProjectedBalance = Math.max(0, summary.remainingCashInHand - returnAmount);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (returnAmount <= 0) return;

    // Calculate intelligent breakdown attribution
    const itemCovered = Math.min(returnAmount, summary.totalItemAmount);
    const platformCovered = Math.min(
      Math.max(0, returnAmount - itemCovered),
      summary.totalPlatformFee
    );

    const res = recordSettlement({
      captainId: captain.id,
      amountReturned: returnAmount,
      paymentMethod,
      receivedBy,
      notes: notes.trim() || undefined,
      breakdown: {
        orderAmountSettled: itemCovered,
        platformFeeSettled: platformCovered,
        deliverySettled: Math.max(0, returnAmount - itemCovered - platformCovered),
      }
    });

    if (res) {
      setCreatedSettlement(res);
      if (onSuccess) onSuccess(res);
    }
  };

  const handleShareWhatsApp = () => {
    if (!createdSettlement) return;
    const text = `🧾 *وەسڵی فەرمی وەرگرتنەوە و هێنانە خوارەوەی پارەی کاپتن - پلاتفۆرمی شاخ*\n` +
      `👤 *ناوی کاپتن:* ${captain.name}\n` +
      `📞 *تەلەفۆن:* ${captain.phone}\n` +
      `🔢 *ژمارەی پسوڵە:* ${createdSettlement.referenceCode}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💵 *بڕی پارەی وەرگیراو:* ${createdSettlement.amountReturned.toLocaleString()} IQD\n` +
      `🛡️ *پشکی پلاتفۆرمی شاخ:* ${summary.totalPlatformFee.toLocaleString()} IQD\n` +
      `🛍️ *پارەی ئۆردەر (کاڵاکان):* ${summary.totalItemAmount.toLocaleString()} IQD\n` +
      `🚴 *کرێی گەیاندنی کاپتن:* ${summary.totalCaptainDeliveryEarnings.toLocaleString()} IQD\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📉 *پارەی ماوە لە لای کاپتن (هێنرایە خوارەوە بۆ):* ${createdSettlement.newBalance.toLocaleString()} IQD\n` +
      `🏦 *شێوازی گەڕاندنەوە:* ${createdSettlement.paymentMethodLabelKu}\n` +
      `👨‍💼 *وەرگیراوە لەلایەن:* ${createdSettlement.receivedBy}\n` +
      `📅 *بەروار و کات:* ${new Date(createdSettlement.createdAt).toLocaleString('en-GB')}\n\n` +
      `سوپاس بۆ خزمەتگوزاری پلاتفۆرمی شاخ.`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = captain.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/964${cleanPhone.replace(/^0/, '')}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {createdSettlement ? 'وەسڵی فەرمی هێنانە خوارەوەی باڵانس' : 'وەرگرتنەوەی پارە و هێنانە خوارەوە لە لای کاپتن'}
              </h3>
              <p className="text-xs text-white/90 mt-0.5 font-medium">
                {captain.name} ({captain.vehiclePlate}) • کۆی کاش: {summary.remainingCashInHand.toLocaleString()} IQD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {createdSettlement ? (
            /* Success Receipt View */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-base">
                  پارەکە بە سەرکەوتوویی لە لای کاپتن وەرگیرایەوە!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  باڵانسی لای کاپتن دەستبەجێ هێنرایە خوارەوە بۆ{' '}
                  <strong className="font-mono text-emerald-900 dark:text-emerald-100 text-sm">
                    {createdSettlement.newBalance.toLocaleString()} IQD
                  </strong>
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3 font-sans">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">پسوڵەی وەرگرتنەوە و هێنانە خوارەوە</span>
                  <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded">
                    #{createdSettlement.referenceCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">ناوی کاپتن:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{createdSettlement.captainName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">شێوازی وەرگرتنەوە:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{createdSettlement.paymentMethodLabelKu}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">بڕی وەرگیراو (هێنراوە خوارەوە):</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      -{createdSettlement.amountReturned.toLocaleString()} IQD
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">باڵانسی نوێی لای کاپتن:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {createdSettlement.newBalance.toLocaleString()} IQD
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">وەرگرتنی لەلایەن:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{createdSettlement.receivedBy}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">بەروار و کات:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {new Date(createdSettlement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(createdSettlement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Breakdown Summary inside receipt */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>پارەی پلاتفۆرمی شاخ:</span>
                    <span className="font-mono font-bold text-primary-600">{summary.totalPlatformFee.toLocaleString()} IQD</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>پارەی ئۆردەری کاڵاکان (فرۆشیار):</span>
                    <span className="font-mono font-bold text-blue-600">{summary.totalItemAmount.toLocaleString()} IQD</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>کرێی گەیاندنی دەستی کاپتن:</span>
                    <span className="font-mono font-bold text-emerald-600">+{summary.totalCaptainDeliveryEarnings.toLocaleString()} IQD</span>
                  </div>
                </div>

                {createdSettlement.notes && (
                  <div className="text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">تێبینی:</span>
                    <span className="text-slate-600 dark:text-slate-300 italic">{createdSettlement.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>ناردن بۆ کاپتن بە واتسئەپ</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپکردن</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  داخستن
                </button>
              </div>
            </div>
          ) : (
            /* Input Settlement Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 3 Pillars Overview at the Top */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-primary-700 dark:text-primary-300">
                    <ShieldCheck className="w-3 h-3" />
                    <span>پلاتفۆرمی شاخ</span>
                  </div>
                  <div className="font-mono font-bold text-xs text-primary-800 dark:text-primary-200 mt-0.5">
                    {summary.totalPlatformFee.toLocaleString()} IQD
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                    <ShoppingBag className="w-3 h-3" />
                    <span>پارەی ئۆردەر</span>
                  </div>
                  <div className="font-mono font-bold text-xs text-blue-800 dark:text-blue-200 mt-0.5">
                    {summary.totalItemAmount.toLocaleString()} IQD
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <Bike className="w-3 h-3" />
                    <span>کرێی کاپتن</span>
                  </div>
                  <div className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-200 mt-0.5">
                    +{summary.totalCaptainDeliveryEarnings.toLocaleString()} IQD
                  </div>
                </div>
              </div>

              {/* Live Balance Deduction Preview Card */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white dark:bg-slate-850 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">کۆی کاشی ئێستای لای کاپتن:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {summary.remainingCashInHand.toLocaleString()} IQD
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>بڕی وەرگیراوە کە دەهێنرێتە خوارەوە:</span>
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    -{returnAmount.toLocaleString()} IQD
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800 font-bold">
                  <span className="text-white">پارەی ماوە لە لای کاپتن (دوای وەرگرتنەوە):</span>
                  <span className={`font-mono text-base font-extrabold ${newProjectedBalance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {newProjectedBalance.toLocaleString()} IQD
                  </span>
                </div>
              </div>

              {/* Amount to Return Field & Quick Select Buttons */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    بڕی پارەی وەرگیراو لە کاپتن (IQD):
                  </label>
                </div>

                {/* Smart Quick Selection based on components */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('full')}
                    className="text-[11px] font-bold py-1 px-2 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    هەموو کاشەکە (Full)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('platform')}
                    className="text-[11px] font-bold py-1 px-2 rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors"
                  >
                    پارەی پلاتفۆرمی شاخ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('order')}
                    className="text-[11px] font-bold py-1 px-2 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                  >
                    پارەی ئۆردەر (کاڵا)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('half')}
                    className="text-[11px] font-bold py-1 px-2 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    نیوەی کاش (50%)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    max={summary.remainingCashInHand}
                    step="500"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(Number(e.target.value))}
                    required
                    className="w-full py-2.5 px-3.5 pe-14 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    IQD
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  شێوازی وەرگرتنەوە لە کاپتن:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH_OFFICE')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 text-xs font-bold transition-colors ${
                      paymentMethod === 'CASH_OFFICE'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>کاش لە ئۆفیس</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('FASTPAY')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 text-xs font-bold transition-colors ${
                      paymentMethod === 'FASTPAY'
                        ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 ring-1 ring-primary-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-red-500" />
                    <span>فاستپەی (FastPay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('FIB')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 text-xs font-bold transition-colors ${
                      paymentMethod === 'FIB'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>FIB بانکی یەکەم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ZAIN_CASH')}
                    className={`p-2.5 rounded-xl border text-start flex items-center gap-2 text-xs font-bold transition-colors ${
                      paymentMethod === 'ZAIN_CASH'
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 ring-1 ring-purple-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>زین کاش (ZainCash)</span>
                  </button>
                </div>
              </div>

              {/* Received By Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ناوی وەرگر / ژمێریاری پلاتفۆرمی شاخ:
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  required
                  placeholder="ناوی ژمێریار یان ئۆپەراسیۆن"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  تێبینی یان ژمارەی حەواڵە (ئارەزوومەندانە):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="نموونە: وەرگرتنەوەی پارەی پلاتفۆرمی شاخ و پارەی ئۆردەرەکانی ئەمڕۆ..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  پەشیمانبوونەوە
                </button>
                <button
                  type="submit"
                  disabled={returnAmount <= 0}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>وەرگرتنەوە و هێنانە خوارەوە</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
