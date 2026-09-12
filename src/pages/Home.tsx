import { useTranslation } from 'react-i18next';
import { Search, MapPin, Store, UtensilsCrossed, Shirt, Car, Heart, Sparkles, Navigation, ChevronDown, Menu } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocationStore } from '../store/useLocationStore';
import { useSidebarStore } from '../store/useSidebarStore';
import { useSocialStore } from '../store/useSocialStore';
import SocialFeed from '../components/social/SocialFeed';

export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const { currentLocation, openModal, hasPromptedOnEntry } = useLocationStore();
  const { openSidebar } = useSidebarStore();
  const { posts, openPostDetail } = useSocialStore();
  const [searchParams] = useSearchParams();

  // Handle deep-linked post from shared social URL (?post=post-1)
  useEffect(() => {
    const postId = searchParams.get('post');
    if (postId) {
      const target = posts.find((p) => p.id === postId);
      if (target) {
        openPostDetail(target);
      }
    }
  }, [searchParams, posts, openPostDetail]);

  // Prompt location selector on initial entry if not chosen yet
  useEffect(() => {
    const chosen = localStorage.getItem('shakh_location_chosen');
    if (!chosen && !hasPromptedOnEntry) {
      const timer = setTimeout(() => {
        openModal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasPromptedOnEntry, openModal]);

  const categories = [
    { id: 'food', name: t('restaurants'), icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { id: 'market', name: t('supermarkets'), icon: Store, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'fashion', name: t('fashion'), icon: Shirt, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { id: 'beauty', name: t('beauty'), icon: Sparkles, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { id: 'umrah', name: t('umrah'), icon: Heart, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    { id: 'car', name: t('cars'), icon: Car, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Sidebar Menu Toggle Button */}
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={openSidebar}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700 shadow-xs"
            title="مینیۆ و زمانەکان / Menu & Languages"
          >
            <Menu className="w-5 h-5 text-primary-600" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold font-display">ش</span>
            </div>
            <span className="text-xl font-bold font-display text-primary-600 tracking-tight">SHAKH</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="mobile-location-btn"
            onClick={openModal}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-xs hover:border-primary-400 transition-all max-w-[170px] truncate"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="truncate">{currentLocation.displayLabel || 'Erbil, KR'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Quick Location Alert Banner if not chosen */}
      {!localStorage.getItem('shakh_location_chosen') && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/10 via-amber-500/10 to-primary-500/10 border border-primary-200 dark:border-primary-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                {currentLang === 'ku'
                  ? 'شوێنی خۆت دیاری بکە بۆ گەیشتنی خێراتری داواکارییەکان'
                  : currentLang === 'ar'
                  ? 'حدد موقعك لعرض المتاجر القريبة وتوصيل أسرع'
                  : 'Set your location for fastest delivery & nearby stores'}
              </span>
              <span className="text-slate-500">
                {currentLang === 'ku'
                  ? 'هەموو شار، قەزا و ناحیەکانی هەرێم و عێراق بەردەستن'
                  : currentLang === 'ar'
                  ? 'جميع محافظات وأقضية ونواحي العراق وكوردستان متاحة'
                  : 'All Kurdistan and Iraq districts & sub-districts available'}
              </span>
            </div>
          </div>
          <button
            onClick={openModal}
            className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors shrink-0 shadow-xs"
          >
            {currentLang === 'ku' ? 'دیاریکردن' : currentLang === 'ar' ? 'تحديد' : 'Select'}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 start-0 pl-4 rtl:pr-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input 
          type="text" 
          className="w-full bg-white dark:bg-slate-900 border-none shadow-sm rounded-2xl py-4 pl-12 pr-4 rtl:pl-4 rtl:pr-12 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-lg"
          placeholder={t('search_placeholder')}
        />
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 font-display">{t('categories')}</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.id} to={`/marketplace?category=${category.id}`} className="flex flex-col items-center gap-3 group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 ${category.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Special Offers Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-sm">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-xs uppercase inline-block mb-3">
            {currentLang === 'ku' ? 'داشکاندنی سەرەتا' : currentLang === 'ar' ? 'عرض البداية' : 'New Launch Offer'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">
            {currentLang === 'ku'
              ? 'داشکاندنی ٥٠٪ لەگەڵ پلاتفۆرمی شاخ'
              : currentLang === 'ar'
              ? 'خصم 50% على أول طلب مع شاخ'
              : 'Special Offers up to 50% on SHAKH'}
          </h2>
          <p className="text-primary-100 mb-5 font-medium text-xs sm:text-sm">
            {currentLang === 'ku'
              ? 'کۆدی SHAKH50 بەکاربهێنە بۆ یەکەم داواکاری لە هەموو مارکێت و چێشتخانەکان'
              : currentLang === 'ar'
              ? 'استخدم الرمز SHAKH50 لخصم فوري وتوصيل سريع لباب بيتك'
              : 'Use code SHAKH50 for instant discounts across all stores & restaurants'}
          </p>
          <Link
            to="/marketplace"
            className="inline-block bg-white text-primary-600 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
          >
            {currentLang === 'ku' ? 'گەڕان لە داشکاندنەکان' : currentLang === 'ar' ? 'استكشف الآن' : 'Explore Now'}
          </Link>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute right-10 top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Social Media Feed & Posts Section */}
      <SocialFeed />

      {/* Popular Businesses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display">{t('popular')} {t('restaurants')}</h2>
          <Link to="/marketplace" className="text-primary-600 font-medium text-sm hover:underline">View All</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[240px] md:min-w-[300px] snap-start card p-0 overflow-hidden group cursor-pointer">
              <div className="h-32 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-white/90 text-slate-900 text-xs font-bold px-2 py-1 rounded-md">4.8 ★</span>
                  <span className="bg-white/90 text-slate-900 text-xs font-medium px-2 py-1 rounded-md">20-30 min</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">Restaurant Name</h3>
                <p className="text-sm text-slate-500 mb-3">Burger • Fast Food</p>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <UtensilsCrossed className="w-4 h-4 text-primary-500" />
                  <span>Free Delivery</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
