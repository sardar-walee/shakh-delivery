import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Store,
  Tag,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Send,
  Eye,
  Check,
  ExternalLink,
  MessageSquare,
  Car,
  Shirt,
  Gauge,
  Fuel,
  Calendar,
  Palette,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../../types/post';
import { useSocialStore } from '../../store/useSocialStore';
import { useCartStore } from '../../store/useCartStore';
import { toast } from '../../store/useToastStore';
import { sharePostToPlatform } from '../../utils/socialShare';
import { Link } from 'react-router-dom';
import { useProductStore } from '../../store/useProductStore';
import PriceTrendChart from '../common/PriceTrendChart';
import { LineChart as ChartIcon, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const {
    toggleLikePost,
    toggleLikeComment,
    addComment,
    openShareModal,
    nextPost,
    prevPost,
  } = useSocialStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [heartAnim, setHeartAnim] = useState(false);
  const [orderedSuccess, setOrderedSuccess] = useState(false);
  const [showPriceTrend, setShowPriceTrend] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Reset image index and price trend when post changes
  useEffect(() => {
    setActiveImageIndex(0);
    setOrderedSuccess(false);
    setShowPriceTrend(false);
  }, [post?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') isRtl ? prevPost() : nextPost();
      if (e.key === 'ArrowLeft') isRtl ? nextPost() : prevPost();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRtl, nextPost, prevPost, onClose]);

  if (!isOpen || !post) return null;

  const content =
    (currentLang === 'ku' ? post.content_ku : currentLang === 'ar' ? post.content_ar : post.content_en) ||
    post.content;

  const handleLike = () => {
    setHeartAnim(true);
    toggleLikePost(post.id);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleDoubleTap = () => {
    if (!post.is_liked) {
      handleLike();
    } else {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 800);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    addComment(post.id, commentInput, visitorName.trim() || undefined);
    setCommentInput('');
    toast.success(
      isRtl ? 'بۆچوونەکەت بە سەرکەوتوویی بڵاوکرایەوە 💬' : 'Comment posted successfully 💬',
      { duration: 2500 }
    );
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickOrder = () => {
    if (post.product) {
      useCartStore.getState().addItem(
        {
          id: post.product.id || `post-prod-${post.id}`,
          name:
            (currentLang === 'ku'
              ? post.product.name_ku || post.product.name
              : currentLang === 'ar'
              ? post.product.name_ar || post.product.name
              : post.product.name) || 'Featured Item',
          price: post.product.price || 10000,
          original_price: post.product.original_price,
          image: post.product.image || post.images[0],
          storeName: post.author.name,
        },
        1,
        true
      );
    } else {
      useCartStore.getState().addItem(
        {
          id: `post-${post.id}`,
          name: post.title || post.author.name,
          price: 15000,
          image: post.images[0],
          storeName: post.author.name,
        },
        1,
        true
      );
    }
    setOrderedSuccess(true);
    setTimeout(() => setOrderedSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Prev / Next Nav Buttons on Desktop */}
      <button
        onClick={isRtl ? nextPost : prevPost}
        className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all z-10"
        title="Previous Post"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={isRtl ? prevPost : nextPost}
        className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all z-10"
        title="Next Post"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col md:flex-row">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: MEDIA CAROUSEL (Interactive with Double-Tap to Like) */}
        <div className="w-full md:w-1/2 bg-slate-950 flex flex-col justify-between relative min-h-[320px] md:min-h-[560px] select-none">
          {/* Main Image Viewer */}
          <div
            className="flex-1 relative flex items-center justify-center cursor-pointer overflow-hidden group"
            onDoubleClick={handleDoubleTap}
          >
            <img
              src={post.images[activeImageIndex] || post.images[0]}
              alt={post.title || post.author.name}
              className="w-full h-full object-cover max-h-[480px] md:max-h-[620px]"
              referrerPolicy="no-referrer"
            />

            {/* Heart Animation Overlay on Double Tap */}
            <AnimatePresence>
              {heartAnim && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                >
                  <div className="w-24 h-24 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-2xl">
                    <Heart className="w-14 h-14 fill-white text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category / Deal Badge Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-primary-600 text-white uppercase tracking-wider shadow-md">
                {post.category}
              </span>
              {post.deal && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{post.deal.discount_label}</span>
                </span>
              )}
            </div>

            {/* Carousel Arrows if multiple images */}
            {post.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : post.images.length - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < post.images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Dots Indicator */}
            {post.images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                {post.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: POST DETAILS, LIKES, PRODUCTS & COMMENTS */}
        <div className="w-full md:w-1/2 flex flex-col justify-between max-h-[500px] md:max-h-[620px] bg-white dark:bg-slate-900 overflow-hidden">
          {/* Top Header: Merchant info */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-primary-500 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {post.author.name}
                  </h4>
                  {post.author.verified && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{post.location_name || post.author.location || 'Erbil, Kurdistan'}</span>
                </p>
              </div>
            </div>

            {/* Quick Call or WhatsApp to Merchant */}
            {post.author.phone && (
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${post.author.phone}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="Call Store"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => sharePostToPlatform(post, 'whatsapp', currentLang)}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                  title="WhatsApp Store"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Center: Content, Product card & Comments */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Post Title & Description */}
            <div className="space-y-2">
              {post.title && (
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {post.title}
                </h3>
              )}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* FULL VEHICLE SPECIFICATIONS (IQ Cars Style) */}
            {(post.car_details || post.category === 'cars') && post.car_details && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                      <Car className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-blue-950 dark:text-blue-100">
                        {post.car_details.make} {post.car_details.model}
                      </h4>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                        مۆدێلی {post.car_details.year} • IQ Cars Standard
                      </span>
                    </div>
                  </div>
                  {post.car_details.price_iqd && (
                    <div className="text-end">
                      <span className="text-xs font-mono font-black text-blue-700 dark:text-blue-300 block">
                        {post.car_details.price_iqd.toLocaleString()} IQD
                      </span>
                    </div>
                  )}
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-750 flex items-center justify-between">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      {isRtl ? 'ڕۆیشتوو:' : 'Mileage:'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {post.car_details.mileage_km.toLocaleString()} کم
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-750 flex items-center justify-between">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {isRtl ? 'تابلۆ:' : 'Plate:'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {post.car_details.plate_city}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-750 flex items-center justify-between">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      {isRtl ? 'سووتەمەنی:' : 'Fuel:'}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {post.car_details.fuel} • {post.car_details.gear === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-750 flex items-center justify-between">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {isRtl ? 'بۆیاخ:' : 'Condition:'}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[130px]" title={post.car_details.condition_status}>
                      {post.car_details.condition_status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* FULL CLOTHING & FASHION SPECIFICATIONS */}
            {(post.fashion_details || post.category === 'fashion') && post.fashion_details && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50/50 dark:from-pink-950/40 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-pink-600 text-white shadow-xs">
                      <Shirt className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-pink-950 dark:text-pink-100">
                        {post.fashion_details.gender === 'men'
                          ? isRtl ? 'جلوبەرگی پیاوان (Men)' : 'Men Collection'
                          : post.fashion_details.gender === 'women'
                          ? isRtl ? 'جلوبەرگی ئافرەتان (Women)' : 'Women Collection'
                          : post.fashion_details.gender === 'kids'
                          ? isRtl ? 'جلوبەرگی منداڵان (Kids)' : 'Kids Collection'
                          : isRtl ? 'یۆنیسێکس (Unisex)' : 'Unisex'}
                      </h4>
                      {post.fashion_details.fabric && (
                        <span className="text-[11px] text-pink-600 dark:text-pink-400 font-bold">
                          قوماش: {post.fashion_details.fabric}
                        </span>
                      )}
                    </div>
                  </div>
                  {post.fashion_details.condition && (
                    <span className="text-[11px] font-extrabold text-pink-700 dark:text-pink-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-pink-200 dark:border-slate-700">
                      {post.fashion_details.condition === 'new' ? '✨ نوێ لە کارتۆن' : 'وەک نوێ'}
                    </span>
                  )}
                </div>

                {/* Available Sizes */}
                {post.fashion_details.sizes && post.fashion_details.sizes.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isRtl ? 'قەبارە بەردەستەکان (Sizes):' : 'Available Sizes:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.fashion_details.sizes.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-pink-200 dark:border-slate-700 text-xs shadow-2xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Colors */}
                {post.fashion_details.colors && post.fashion_details.colors.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {isRtl ? 'ڕەنگە بەردەستەکان (Colors):' : 'Available Colors:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.fashion_details.colors.map((c, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-pink-900/40 text-pink-900 dark:text-pink-200 font-bold border border-pink-200 dark:border-pink-800 text-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEATURED PRODUCT IN POST (Instant Purchase & Price Trend Tracker) */}
            {post.product && (
              <div className="space-y-2">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-950/30 dark:to-amber-950/20 border border-primary-200/80 dark:border-primary-800/60 flex items-center justify-between gap-3">
                  <div
                    onClick={() => {
                      if (post.product) {
                        useProductStore.getState().openProductModal({
                          id: post.product.id,
                          name: post.product.name,
                          name_ku: post.product.name_ku,
                          name_ar: post.product.name_ar,
                          category: 'general',
                          price: post.product.price,
                          original_price: post.product.original_price,
                          discount_percent: post.product.discount_percent,
                          image: post.product.image,
                          in_stock: post.product.in_stock,
                          rating: 4.9,
                          reviews_count: 54,
                          store_name: post.author.name,
                          store_avatar: post.author.avatar,
                          store_location: post.location_name || post.author.location,
                        });
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title="Click to view full product details & specs"
                  >
                    <img
                      src={post.product.image}
                      alt={post.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-primary-700 dark:text-primary-300 block">
                          {isRtl ? 'کاڵای پۆست' : 'Featured Product'}
                        </span>
                        {post.product.discount_percent && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white">
                            {post.product.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                        {currentLang === 'ku'
                          ? post.product.name_ku || post.product.name
                          : currentLang === 'ar'
                          ? post.product.name_ar || post.product.name
                          : post.product.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-black text-xs text-primary-600 dark:text-primary-400">
                          {post.product.price.toLocaleString()} IQD
                        </span>
                        {post.product.original_price && (
                          <span className="font-mono text-[10px] text-slate-400 line-through">
                            {post.product.original_price.toLocaleString()} IQD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPriceTrend(!showPriceTrend)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                        showPriceTrend
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-400'
                      }`}
                      title="شیکاری و مێژووی نرخی ٣٠ ڕۆژ / 30-Day Price Trend"
                    >
                      <ChartIcon className="w-3.5 h-3.5 text-primary-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] hidden sm:inline">
                        {isRtl ? 'مێژووی نرخ' : 'Price Trend'}
                      </span>
                      {showPriceTrend ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickOrder}
                      className="px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isRtl ? 'داواکردن' : 'Order'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Recharts 30-Day Price Trend Chart */}
                {showPriceTrend && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PriceTrendChart
                      productId={post.product.id || `post-prod-${post.id}`}
                      productName={
                        (currentLang === 'ku'
                          ? post.product.name_ku || post.product.name
                          : currentLang === 'ar'
                          ? post.product.name_ar || post.product.name
                          : post.product.name) || 'Product'
                      }
                      currentPrice={post.product.price}
                      originalPrice={post.product.original_price}
                      category="food"
                      compact={true}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick Order Success Notice */}
            {orderedSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isRtl
                      ? 'داواکارییەکەت بە سەرکەوتوویی زیادکرا بۆ سەبەتەی کڕین!'
                      : 'Item successfully added to your order cart!'}
                  </span>
                </div>
                <Link
                  to="/orders"
                  className="underline text-[11px] font-black hover:opacity-80"
                >
                  {isRtl ? 'بینینی داواکاری' : 'View Orders'}
                </Link>
              </motion.div>
            )}

            {/* VISITOR COMMENTS SECTION */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isRtl ? 'بۆچوون و پرسیاری سەردانیکەران' : 'Visitor Comments & Inquiries'}</span>
                <span>{post.comments.length} {isRtl ? 'بۆچوون' : 'Comments'}</span>
              </div>

              <div className="space-y-2.5">
                {post.comments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                    {isRtl ? 'یەکەم کەس بە کە بۆچوونی خۆت بنووسیت!' : 'Be the first to leave a comment!'}
                  </div>
                ) : (
                  post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <img
                          src={comment.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={comment.user_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {comment.user_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>

                      {/* Comment Like Heart */}
                      <button
                        type="button"
                        onClick={() => toggleLikeComment(post.id, comment.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold p-1 rounded-lg transition-colors ${
                          comment.is_liked
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-rose-600' : ''}`}
                        />
                        {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                      </button>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>
          </div>

          {/* BOTTOM INTERACTION BAR: LIKES, SHARE, COMMENT INPUT */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 space-y-3">
            {/* Likes & Shares Counters Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* LIKE BUTTON (VISITOR & USER) */}
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                    post.is_liked
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-300 dark:border-rose-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-rose-500'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      post.is_liked ? 'fill-rose-600 text-rose-600 scale-110' : ''
                    }`}
                  />
                  <span>
                    {post.likes_count.toLocaleString()} {isRtl ? 'لایک' : 'Likes'}
                  </span>
                </button>

                {/* SHARE MODAL TRIGGER */}
                <button
                  type="button"
                  onClick={() => openShareModal(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
                >
                  <Share2 className="w-4 h-4 text-primary-600" />
                  <span>
                    {post.shares_count.toLocaleString()} {isRtl ? 'هاوبەشکردن' : 'Share'}
                  </span>
                </button>
              </div>

              {/* Views Counter */}
              <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views_count.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Share Icons Row */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500">
                {isRtl ? 'هاوبەشکردنی خێرا:' : 'Quick Share:'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => sharePostToPlatform(post, 'whatsapp', currentLang)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="WhatsApp"
                >
                  <span>💬 واتس ئاپ</span>
                </button>
                <button
                  onClick={() => sharePostToPlatform(post, 'telegram', currentLang)}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Telegram"
                >
                  <span>✈️ تێلێگرام</span>
                </button>
                <button
                  onClick={() => sharePostToPlatform(post, 'facebook', currentLang)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Facebook"
                >
                  <span>🌐 فەیسبووک</span>
                </button>
                <button
                  onClick={() => openShareModal(post)}
                  className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                  title="More Share Options"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                placeholder={isRtl ? 'بۆچوونێک یان پرسیارێک بنووسە...' : 'Write a comment or question...'}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 input-field text-xs py-2 px-3 rounded-xl"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRtl ? 'ناردن' : 'Post'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
