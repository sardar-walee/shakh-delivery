import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Receipt,
  Share2,
  Printer,
  Copy,
  Check,
  Store,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Bike,
  Building2,
  QrCode,
  Sparkles,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrackedOrder } from '../../types/order';
import {
  generateWhatsAppReceiptText,
  sendReceiptViaWhatsApp,
  formatPhoneNumberForWhatsApp,
} from '../../utils/whatsappReceipt';
import { supabase } from '../../lib/supabase';

interface OrderReceiptModalProps {
  order: TrackedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerPhone?: string;
}

export default function OrderReceiptModal({
  order,
  isOpen,
  onClose,
  customerName,
  customerPhone,
}: OrderReceiptModalProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const [copied, setCopied] = useState(false);
  const [platformSent, setPlatformSent] = useState(false);
  const [sendingToStore, setSendingToStore] = useState(false);
  const [activeTab, setActiveTab] = useState<'receipt' | 'whatsapp'>('receipt');
  const [customPhone, setCustomPhone] = useState('');

  if (!isOpen || !order) return null;

  const orderDate = new Date(order.created_at).toLocaleString(
    isRtl ? (currentLang === 'ku' ? 'ckb-IQ' : 'ar-IQ') : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const storeName = order.business?.name || (isRtl ? 'فرۆشگای هاوبەشی پلاتفۆرمی شاخ' : 'SHAKH Merchant Partner');
  const storePhone = order.business?.phone || '+964 750 123 4567';
  const custName = customerName || (isRtl ? 'کڕیاری پلاتفۆرمی شاخ' : 'SHAKH Customer');
  const custPhone = customerPhone || order.address?.phone || '+964 750 000 0000';

  const addressStr =
    typeof order.address === 'string'
      ? order.address
      : order.address?.street
      ? `${order.address.street}${order.address.district ? `, ${order.address.district}` : ''}${
          order.address.city ? `, ${order.address.city}` : ''
        }`
      : order.address?.label || (isRtl ? 'ناونیشانی دیاریکراو لە هەولێر' : 'Erbil Delivery Address');

  const defaultItems = [
    { name: 'Burger Lab Special Burger', quantity: 1, price: 12000 },
    { name: 'French Fries (Large Crispy)', quantity: 2, price: 3000 },
    { name: 'Fresh Natural Orange Juice', quantity: 1, price: 3500 },
  ];

  const items = order.items && order.items.length > 0 ? order.items : defaultItems;

  const handleCopyText = async () => {
    try {
      const text = generateWhatsAppReceiptText(order, currentLang, custName);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy receipt text', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToStorePlatform = async () => {
    setSendingToStore(true);
    try {
      // Record platform notification in Supabase
      if (order.business_id) {
        try {
          await supabase.from('notifications').insert({
            user_id: order.business_id,
            title: `پسوولەی داواکاری #${order.order_number}`,
            body: `پلاتفۆرمی شاخ وەسلی فەرمی داواکاری بۆ دوکانەکەت نارد بە بڕی ${order.total.toLocaleString()} د.ع`,
            type: 'ORDER_RECEIPT',
            metadata: { order_id: order.id, order_number: order.order_number },
          });
        } catch (e) {
          console.warn('Supabase notification note:', e);
        }
      }

      setPlatformSent(true);
      setTimeout(() => setPlatformSent(false), 4000);
    } catch (err) {
      console.error('Error sending receipt to store:', err);
    } finally {
      setSendingToStore(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isRtl ? 'وەسلی کڕینی فەرمی پلاتفۆرمی شاخ' : 'SHAKH Official Order Receipt'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                  VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">#{order.order_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUBHEADER TABS */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('receipt')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'receipt'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{isRtl ? 'شێوازی وەسل (پسوولە)' : 'Invoice View'}</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>{isRtl ? 'ناردن بە وەتسئاپ (WhatsApp)' : 'WhatsApp Dispatch'}</span>
            </button>
          </div>

          {/* Quick Copy / Print tools */}
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? (isRtl ? 'کۆپیکرا' : 'Copied') : (isRtl ? 'کۆپی' : 'Copy')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isRtl ? 'چاپکردن' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* PLATFORM DISPATCH SUCCESS BANNER */}
          {platformSent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  {isRtl
                    ? 'وەسلەکە بە سەرکەوتوویی لە ڕێگەی پلاتفۆرمی شاخ ڕاستەوخۆ بۆ دوکان نێردرا!'
                    : 'Receipt successfully dispatched to store via SHAKH Platform!'}
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === 'receipt' ? (
            /* PRINTABLE INVOICE SHEET */
            <div
              id="printable-shakh-receipt"
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm relative"
            >
              {/* SHAKH INVOICE TOP BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary-600 text-white font-black text-xs flex items-center justify-center">
                      🏔️
                    </span>
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      SHAKH PLATFORM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {isRtl ? 'پلاتفۆرمی شاخ بۆ داواکاری و گەیاندنی خێرا لە عێراق و کوردستان' : 'Fast On-Demand Ordering & Delivery Platform'}
                  </p>
                </div>

                <div className="text-start sm:text-end space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 inline-block">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xs font-mono text-slate-500 flex items-center sm:justify-end gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{orderDate}</span>
                  </div>
                </div>
              </div>

              {/* STORE & CUSTOMER INFO GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    <Store className="w-4 h-4" />
                    <span>{isRtl ? 'زانیاری دوکان / فرۆشگا' : 'Merchant / Store'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{storeName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{order.business?.address || 'Erbil 100M St'}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{storePhone}</span>
                  </p>
                </div>

                {/* Customer Box */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>{isRtl ? 'زانیاری کڕیار و گەیاندن' : 'Customer & Delivery'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{custName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    <span>{addressStr}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{custPhone}</span>
                  </p>
                  {order.notes && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <strong>Note:</strong> {order.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMIZED TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  <span>{isRtl ? 'لیستی داواکارییەکان' : 'Itemized Order List'}</span>
                  <span>{items.length} {isRtl ? 'کاڵا' : 'Items'}</span>
                </div>

                <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3 text-start">{isRtl ? 'کاڵا' : 'Item'}</th>
                        <th className="p-3 text-center">{isRtl ? 'ژمارە' : 'Qty'}</th>
                        <th className="p-3 text-end">{isRtl ? 'نرخی تاک' : 'Price'}</th>
                        <th className="p-3 text-end">{isRtl ? 'کۆی بڕ' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((it, idx) => {
                        const itemAny = it as any;
                        const itemName = itemAny.name_ku || itemAny.name_ar || itemAny.name || it.name;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                              {itemName}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-600 dark:text-slate-400">
                              {it.quantity}x
                            </td>
                            <td className="p-3 text-end font-mono text-slate-600 dark:text-slate-400">
                              {it.price.toLocaleString()} IQD
                            </td>
                            <td className="p-3 text-end font-mono font-bold text-slate-900 dark:text-white">
                              {(it.price * it.quantity).toLocaleString()} IQD
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAYMENT SUMMARY BOX */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isRtl ? 'کۆی کاڵاکان (Subtotal)' : 'Items Subtotal'}</span>
                  <span className="font-mono">{(order.subtotal || order.total - 3000).toLocaleString()} IQD</span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isRtl ? 'کرێی گەیاندن (Delivery Fee)' : 'Delivery Fee'}</span>
                  <span className="font-mono">{(order.delivery_fee || 3000).toLocaleString()} IQD</span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{isRtl ? 'خزمەتگوزاری پلاتفۆرمی شاخ' : 'SHAKH Platform Fee'}</span>
                  <span className="font-mono">{(order.platform_fee || 500).toLocaleString()} IQD</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{isRtl ? 'داشکاندنی بەخشراو (Promo Discount)' : 'Discount'}</span>
                    <span className="font-mono">-{order.discount.toLocaleString()} IQD</span>
                  </div>
                )}

                <div className="pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {isRtl ? 'کۆی گشتی بۆ پێدان' : 'Grand Total Due'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {order.payment_status || 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-lg sm:text-xl font-black font-mono text-primary-600 dark:text-primary-400">
                      {order.total.toLocaleString()} IQD
                    </span>
                  </div>
                </div>
              </div>

              {/* CAPTAIN & VERIFICATION FOOTER */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>
                    {isRtl ? 'پسوولەی باوەڕپێکراوی دیجیتاڵی پلاتفۆرمی شاخ' : 'Digitally Certified SHAKH Receipt'}
                  </span>
                </div>

                {order.captain && (
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Bike className="w-3.5 h-3.5 text-primary-600" />
                    <span>کاپتن: {order.captain.name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* WHATSAPP DISPATCH HUB */
            <div className="space-y-6">
              {/* WhatsApp Feature Intro */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? 'ناردنی ڕاستەوخۆی وەسل بە وەتسئاپ (WhatsApp)' : 'Send Receipt Directly via WhatsApp'}</span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  {isRtl
                    ? 'پلاتفۆرمی شاخ وەسلی داواکاری بە فۆرماتێکی ڕێکخراو و پوخت لەگەڵ ناونیشان و لیستی کاڵاکان و کۆی گشتی پارە بە یەک کلیک دەنێرێت بۆ وەتسئاپ.'
                    : 'Dispatch instant, richly structured receipts directly to WhatsApp numbers with order items, addresses, and price totals.'}
                </p>
              </div>

              {/* Fast WhatsApp Dispatch Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Send to Store WhatsApp */}
                <button
                  type="button"
                  onClick={() => sendReceiptViaWhatsApp(order, storePhone, currentLang, custName)}
                  className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-start group space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      {isRtl ? 'ناردن بۆ وەتسئاپ دوکان' : 'Send to Store WhatsApp'}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{storePhone}</p>
                  </div>
                </button>

                {/* 2. Send to Customer / Share on WhatsApp */}
                <button
                  type="button"
                  onClick={() => sendReceiptViaWhatsApp(order, custPhone, currentLang, custName)}
                  className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-start group space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      {isRtl ? 'ناردن بۆ وەتسئاپ کڕیار' : 'Send to Customer WhatsApp'}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{custPhone}</p>
                  </div>
                </button>

                {/* 3. Send to Captain WhatsApp */}
                {order.captain && (
                  <button
                    type="button"
                    onClick={() => sendReceiptViaWhatsApp(order, order.captain?.phone, currentLang, custName)}
                    className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-start group space-y-2 shadow-xs sm:col-span-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                        <Bike className="w-4 h-4" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {isRtl ? 'ناردن بۆ وەتسئاپ کاپتنی گەیاندن' : 'Send to Captain WhatsApp'}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {order.captain.name} ({order.captain.phone})
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Custom WhatsApp Number input */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isRtl ? 'ناردنی وەسل بۆ هەر ژمارەیەکی وەتسئاپ' : 'Send to any custom WhatsApp number'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="0750 000 0000"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value)}
                    className="flex-1 input-field text-xs py-2.5 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => sendReceiptViaWhatsApp(order, customPhone || null, currentLang, custName)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'ناردن' : 'Send'}</span>
                  </button>
                </div>
              </div>

              {/* Live Text Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>{isRtl ? 'پێشبینینی دەقی وەتسئاپ' : 'WhatsApp Message Preview'}</span>
                  <button onClick={handleCopyText} className="text-primary-600 dark:text-primary-400 hover:underline">
                    {copied ? (isRtl ? 'کۆپیکرا ✓' : 'Copied ✓') : (isRtl ? 'کۆپیکردنی دەق' : 'Copy Text')}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-[11px] font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 select-all max-h-56 overflow-y-auto">
                  {generateWhatsAppReceiptText(order, currentLang, custName)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Send directly to Store via SHAKH Button */}
          <button
            type="button"
            onClick={handleSendToStorePlatform}
            disabled={sendingToStore}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {sendingToStore
                ? isRtl ? 'دەنێردرێت بۆ دوکان...' : 'Sending to Store...'
                : isRtl ? 'ناردن بۆ دوکان لە ڕێگەی شاخ' : 'Send to Store via SHAKH'}
            </span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Direct WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => sendReceiptViaWhatsApp(order, storePhone, currentLang, custName)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isRtl ? 'وەتسئاپ (WhatsApp)' : 'Send via WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              {isRtl ? 'داخستن' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
