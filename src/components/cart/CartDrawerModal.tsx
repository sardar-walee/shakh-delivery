import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

export default function CartDrawerModal() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';
  const navigate = useNavigate();

  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getItemCount,
  } = useCartStore();

  if (!isOpen) return null;

  const total = getTotalPrice();
  const deliveryFee = items.length > 0 ? 3000 : 0;
  const grandTotal = total + deliveryFee;

  const handleCheckout = () => {
    closeCart();
    navigate('/orders');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs overflow-hidden animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={closeCart} />

      {/* Cart Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-right rtl:slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isRtl ? 'سەبەتەی کڕین' : 'Shopping Cart'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-bold">
                  {getItemCount()} {isRtl ? 'کاڵا' : 'items'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRtl ? 'پلاتفۆرمی خزمەتگوزاری و داواکاری شاخ' : 'SHAKH Direct Marketplace & Delivery'}
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  {isRtl ? 'سەبەتەی کڕین بەتاڵە' : 'Your cart is empty'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {isRtl
                    ? 'دەتوانیت لە بەشی بازاڕ، چێشتخانە و ئۆفەرەکانی پۆست کاڵا بۆ سەبەتەکەت زیاد بکەیت.'
                    : 'Explore the marketplace and live deals to add items to your cart.'}
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/marketplace');
                }}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                {isRtl ? 'گەڕان لە بازاڕ و فرۆشگاکان' : 'Explore Marketplace'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-slate-500">
                  {isRtl ? 'کاڵا هەڵبژێردراوەکان' : 'Selected Items'}
                </span>
                <button
                  type="button"
                  onClick={() => clearCart(true)}
                  className="text-rose-500 hover:text-rose-700 font-semibold text-[11px] transition-colors"
                >
                  {isRtl ? 'بەتاڵکردنەوەی هەموو' : 'Clear All'}
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h5>
                      {item.storeName && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                          <Store className="w-3 h-3" />
                          <span>{item.storeName}</span>
                        </p>
                      )}
                      <span className="font-mono font-black text-xs text-primary-600 dark:text-primary-400 block mt-1">
                        {(item.price * item.quantity).toLocaleString()} IQD
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-xs w-6 text-center text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, true)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{isRtl ? 'کۆی کاڵاکان' : 'Subtotal'}</span>
                <span className="font-mono font-bold">{total.toLocaleString()} IQD</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>{isRtl ? 'کرێی گەیاندن (تەخمینی)' : 'Est. Delivery Fee'}</span>
                <span className="font-mono font-bold">{deliveryFee.toLocaleString()} IQD</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>{isRtl ? 'کۆی گشتی' : 'Total Amount'}</span>
                <span className="font-mono text-primary-600 dark:text-primary-400 text-base">
                  {grandTotal.toLocaleString()} IQD
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isRtl ? 'تەواوکردنی داواکاری و کڕین' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
