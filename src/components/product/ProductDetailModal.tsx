import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Star,
  ShoppingBag,
  Share2,
  ShieldCheck,
  MapPin,
  Clock,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Heart,
  TrendingDown,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { toast } from '../../store/useToastStore';
import PriceTrendChart from '../common/PriceTrendChart';
import { formatIQD } from '../../utils/priceTrendUtils';

export default function ProductDetailModal() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const { activeProduct, isOpen, closeProductModal, products, openProductModal } = useProductStore();
  const { addItem, openCart } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (activeProduct) {
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [activeProduct?.id]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeProductModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeProductModal]);

  if (!isOpen || !activeProduct) return null;

  const product = activeProduct;
  const name =
    (currentLang === 'ku'
      ? product.name_ku || product.name
      : currentLang === 'ar'
      ? product.name_ar || product.name
      : product.name_en || product.name) || product.name;

  const description =
    (currentLang === 'ku'
      ? product.description_ku || product.description
      : currentLang === 'ar'
      ? product.description_ar || product.description
      : product.description) || product.description;

  const gallery =
    product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = (directOpenCart = false) => {
    addItem(
      {
        id: product.id,
        name,
        name_ku: product.name_ku,
        name_ar: product.name_ar,
        price: product.price,
        original_price: product.original_price,
        image: product.image,
        storeName: product.store_name,
        category: product.category,
      },
      quantity,
      true // trigger toast
    );

    if (directOpenCart) {
      closeProductModal();
      openCart();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/marketplace?product=${product.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(
        isRtl ? 'لینکی کاڵا کۆپی کرا 📋' : 'Product link copied to clipboard 📋'
      );
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find next and prev product
  const currentIndex = products.findIndex((p) => p.id === product.id);
  const prevProduct = currentIndex > 0 ? products[currentIndex - 1] : products[products.length - 1];
  const nextProduct = currentIndex < products.length - 1 ? products[currentIndex + 1] : products[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={closeProductModal} />

      {/* Prev / Next Floating Navigation on Desktop */}
      <button
        onClick={() => openProductModal(isRtl ? nextProduct : prevProduct)}
        className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all z-10"
        title="Previous Product"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => openProductModal(isRtl ? prevProduct : nextProduct)}
        className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all z-10"
        title="Next Product"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col z-10">
        {/* Sticky Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                  {name}
                </h3>
                {product.discount_percent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase shadow-2xs">
                    {product.discount_percent}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{product.store_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Truck className="w-3 h-3" />
                  {product.delivery_time_mins || 30} mins
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-xl transition-colors ${
                isLiked
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={closeProductModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Section: Gallery + Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Product Images Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 group shadow-xs">
                <img
                  src={gallery[selectedImageIndex] || product.image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                {product.discount_percent && (
                  <div className="absolute top-3 start-3 px-3 py-1 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md">
                    {isRtl ? `داشکاندنی ${product.discount_percent}٪` : `${product.discount_percent}% OFF`}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-primary-600 ring-2 ring-primary-500/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Pricing, Store Info, Specs & Actions */}
            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                {/* Store Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
                  <img
                    src={product.store_avatar || product.image}
                    alt={product.store_name}
                    className="w-4 h-4 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span>{product.store_name}</span>
                  {product.store_verified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white leading-tight">
                  {name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">
                      ({product.reviews_count} {isRtl ? 'هەڵسەنگاندن' : 'reviews'})
                    </span>
                  </div>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'لە کۆگا بەردەستە' : 'In Stock'}</span>
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex items-baseline justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      {isRtl ? 'نرخی کڕین:' : 'Current Price:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-black text-2xl sm:text-3xl text-primary-600 dark:text-primary-400">
                        {formatIQD(product.price, currentLang)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="font-mono text-sm text-slate-400 line-through">
                          {formatIQD(product.original_price, currentLang)}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.original_price && product.original_price > product.price && (
                    <div className="text-end">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        {isRtl ? 'بڕی داشکاندن:' : 'You Save:'}
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {formatIQD(product.original_price - product.price, currentLang)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Specs & Attributes */}
              {product.specs && product.specs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-[10px] text-slate-400 block">{spec.label}</span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector & Order Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'ژمارە / دانە:' : 'Quantity:'}
                  </span>
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 transition-colors shadow-2xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-sm w-6 text-center text-slate-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    className="btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isRtl ? 'زیادکردن بۆ سەبەتە' : 'Add to Cart'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(true)}
                    className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all shadow-sm active:scale-98 text-center"
                  >
                    {isRtl ? 'کڕینی خێرا' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 30-Day Recharts Price Trend Chart Section */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <PriceTrendChart
              productId={product.id}
              productName={name}
              currentPrice={product.price}
              originalPrice={product.original_price}
              category={product.category}
              customHistory={product.custom_price_history}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
