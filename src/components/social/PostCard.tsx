import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Sparkles,
  ShoppingBag,
  Eye,
  Check,
  Send,
  MoreHorizontal,
  ExternalLink,
  Car,
  Shirt,
  Gauge,
  Fuel,
  Calendar,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../../types/post';
import { useSocialStore } from '../../store/useSocialStore';
import { useCartStore } from '../../store/useCartStore';
import { useProductStore } from '../../store/useProductStore';
import { toast } from '../../store/useToastStore';
import { sharePostToPlatform } from '../../utils/socialShare';
import { LineChart as ChartIcon } from 'lucide-react';

interface PostCardProps {
  post: Post;
  key?: React.Key;
}

export default function PostCard({ post }: PostCardProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const {
    toggleLikePost,
    openPostDetail,
    openShareModal,
    addComment,
  } = useSocialStore();

  const [heartAnim, setHeartAnim] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const content =
    (currentLang === 'ku' ? post.content_ku : currentLang === 'ar' ? post.content_ar : post.content_en) ||
    post.content;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnim(true);
    toggleLikePost(post.id);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.is_liked) {
      toggleLikePost(post.id);
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleSendQuickComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickComment.trim()) return;
    addComment(post.id, quickComment);
    setQuickComment('');
    toast.success(
      isRtl ? 'بۆچوونەکەت تۆمار کرا 💬' : 'Comment added 💬',
      { duration: 2500 }
    );
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await sharePostToPlatform(post, 'copy_link', currentLang);
    setCopiedLink(true);
    toast.success(
      isRtl ? 'لینکی پۆستەکە کۆپی کرا 📋' : 'Post link copied to clipboard 📋',
      { duration: 2500 }
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article
      id={`post-${post.id}`}
      className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md transition-shadow"
    >
      {/* 1. POST HEADER (Author, Verified, Location, Share dropdown) */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div
          onClick={() => openPostDetail(post)}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-2xl object-cover border-2 border-primary-500/80 group-hover:scale-105 transition-transform shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                {post.author.name}
              </h4>
              {post.author.verified && (
                <span
                  className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  title="Verified Merchant"
                >
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{post.location_name || post.author.location || 'Erbil, Kurdistan'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {post.category}
          </span>
          <button
            onClick={() => openShareModal(post)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Share options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MEDIA SECTION (Interactive Image with Double Tap Heart) */}
      <div
        onClick={() => openPostDetail(post)}
        onDoubleClick={handleDoubleTap}
        className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 overflow-hidden cursor-pointer group"
      >
        <img
          src={post.images[0]}
          alt={post.title || post.author.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Double-tap animated heart */}
        <AnimatePresence>
          {heartAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-2xl">
                <Heart className="w-12 h-12 fill-white text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deal or Multiple Images Badge */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex gap-2">
          {post.deal && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{post.deal.discount_label}</span>
            </span>
          )}
          {post.images.length > 1 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs">
              1/{post.images.length}
            </span>
          )}
        </div>

        {/* Click hint hover badge */}
        <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <span>{isRtl ? 'کلیک بکە بۆ بینینی تەواو' : 'Click to view post'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3. POST CONTENT & EMBEDDED PRODUCT CARD */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Title & snippet */}
        <div onClick={() => openPostDetail(post)} className="cursor-pointer space-y-1.5">
          {post.title && (
            <h3 className="font-bold text-base text-slate-900 dark:text-white hover:text-primary-600 transition-colors leading-snug">
              {post.title}
            </h3>
          )}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {content}
          </p>
        </div>

        {/* VEHICLE DETAILS (IQ Cars Style) */}
        {(post.car_details || post.category === 'cars') && post.car_details && (
          <div
            onClick={() => openPostDetail(post)}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/50 space-y-2.5 cursor-pointer hover:border-blue-400 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-blue-600 text-white shadow-2xs">
                  <Car className="w-3.5 h-3.5" />
                </span>
                <span className="font-extrabold text-xs text-blue-950 dark:text-blue-200">
                  {post.car_details.make} {post.car_details.model} ({post.car_details.year})
                </span>
              </div>
              {post.car_details.price_iqd && (
                <span className="font-mono font-black text-xs text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl shadow-2xs border border-blue-100 dark:border-blue-850">
                  {post.car_details.price_iqd.toLocaleString()} IQD
                </span>
              )}
            </div>

            {/* IQ Cars Spec Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-bold">
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-blue-100/60 dark:border-slate-700/60 truncate">
                <Gauge className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">{post.car_details.mileage_km.toLocaleString()} کم</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-blue-100/60 dark:border-slate-700/60 truncate">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">{post.car_details.plate_city}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-blue-100/60 dark:border-slate-700/60 truncate">
                <Fuel className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate capitalize">{post.car_details.fuel} • {post.car_details.gear === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-400 flex items-center gap-1 border border-blue-100/60 dark:border-slate-700/60 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{post.car_details.condition_status}</span>
              </div>
            </div>
          </div>
        )}

        {/* FASHION & CLOTHING DETAILS */}
        {(post.fashion_details || post.category === 'fashion') && post.fashion_details && (
          <div
            onClick={() => openPostDetail(post)}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-rose-50/50 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200/80 dark:border-pink-900/50 space-y-2.5 cursor-pointer hover:border-pink-400 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-pink-600 text-white shadow-2xs">
                  <Shirt className="w-3.5 h-3.5" />
                </span>
                <span className="font-extrabold text-xs text-pink-950 dark:text-pink-200">
                  {post.fashion_details.gender === 'men'
                    ? isRtl ? 'بۆ پیاوان (Men)' : 'Men Fashion'
                    : post.fashion_details.gender === 'women'
                    ? isRtl ? 'بۆ ئافرەتان (Women)' : 'Women Fashion'
                    : post.fashion_details.gender === 'kids'
                    ? isRtl ? 'بۆ منداڵان (Kids)' : 'Kids Fashion'
                    : isRtl ? 'یۆنیسێکس (Unisex)' : 'Unisex'}
                </span>
              </div>
              {post.fashion_details.fabric && (
                <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-pink-200 dark:border-slate-700">
                  {post.fashion_details.fabric}
                </span>
              )}
            </div>

            {/* Colors & Sizes Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {post.fashion_details.sizes && post.fashion_details.sizes.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[10px] font-bold">{isRtl ? 'قەبارە:' : 'Sizes:'}</span>
                  <div className="flex flex-wrap gap-1">
                    {post.fashion_details.sizes.map((s, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-pink-200 dark:border-slate-700 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {post.fashion_details.colors && post.fashion_details.colors.length > 0 && (
                <div className="flex items-center gap-1 ms-auto">
                  <Palette className="w-3 h-3 text-pink-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                    {post.fashion_details.colors.join('، ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FEATURED PRODUCT PILL (If tagged) */}
        {post.product && (
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
                  reviews_count: 38,
                  store_name: post.author.name,
                  store_avatar: post.author.avatar,
                  store_location: post.location_name || post.author.location,
                });
              }
            }}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:border-primary-400 transition-all group"
            title="Click to view full specs & 30-Day price trend"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={post.product.image}
                alt={post.product.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isRtl ? 'کاڵای دیاریکراو' : 'Tagged Item'}
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate block group-hover:text-primary-600 transition-colors">
                  {currentLang === 'ku'
                    ? post.product.name_ku || post.product.name
                    : currentLang === 'ar'
                    ? post.product.name_ar || post.product.name
                    : post.product.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
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
                      reviews_count: 38,
                      store_name: post.author.name,
                      store_avatar: post.author.avatar,
                      store_location: post.location_name || post.author.location,
                    });
                  }
                }}
                className="px-2 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 text-[11px] font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-600 hover:border-primary-400 transition-all shadow-2xs"
                title="View 30-Day Price Fluctuations"
              >
                <ChartIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{isRtl ? 'نرخ' : 'Trend'}</span>
              </button>

              <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                {post.product.price.toLocaleString()} IQD
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (post.product) {
                    useCartStore.getState().addItem(
                      {
                        id: post.product.id || `prod-${post.id}`,
                        name:
                          (currentLang === 'ku'
                            ? post.product.name_ku || post.product.name
                            : currentLang === 'ar'
                            ? post.product.name_ar || post.product.name
                            : post.product.name) || 'Product',
                        price: post.product.price,
                        original_price: post.product.original_price,
                        image: post.product.image,
                        storeName: post.author.name,
                      },
                      1,
                      true
                    );
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>{isRtl ? 'کڕین' : 'Buy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. ACTION CONTROLS (Like button, Comment button, Social share) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LIKE BUTTON (VISITORS & USERS) */}
            <button
              id={`like-btn-${post.id}`}
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                post.is_liked
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-300 dark:border-rose-800 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  post.is_liked ? 'fill-rose-600 text-rose-600 scale-110' : ''
                }`}
              />
              <span>{post.likes_count.toLocaleString()}</span>
            </button>

            {/* COMMENT BUTTON (Opens Full Modal) */}
            <button
              id={`comment-btn-${post.id}`}
              type="button"
              onClick={() => openPostDetail(post)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <span>{post.comments_count.toLocaleString()}</span>
            </button>

            {/* SHARE MODAL BUTTON */}
            <button
              id={`share-btn-${post.id}`}
              type="button"
              onClick={() => openShareModal(post)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 text-xs font-bold transition-colors shadow-xs"
              title="هاوبەشکردن لە سۆشیال میدیا"
            >
              <Share2 className="w-4 h-4 text-primary-600" />
              <span className="hidden sm:inline">{isRtl ? 'هاوبەشکردن' : 'Share'}</span>
              <span>({post.shares_count})</span>
            </button>
          </div>

          {/* Views counter & Copy link */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition-colors"
              title="Copy link"
            >
              {copiedLink ? (
                <span className="text-emerald-600 font-bold text-[11px]">کۆپیکرا ✓</span>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.views_count}</span>
            </span>
          </div>
        </div>

        {/* 5. QUICK INLINE COMMENT INPUT */}
        <form onSubmit={handleSendQuickComment} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder={isRtl ? 'بۆچوونی خۆت بنووسە وەک سەردانیکەر...' : 'Add a quick comment...'}
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary-500 outline-none"
          />
          <button
            type="submit"
            disabled={!quickComment.trim()}
            className="p-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </article>
  );
}
