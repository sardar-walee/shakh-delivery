import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Home,
  Store,
  ClipboardList,
  User,
  Crown,
  MapPin,
  Globe2,
  Moon,
  Sun,
  LogOut,
  LogIn,
  ChevronRight,
  ShieldCheck,
  Bike,
  Building2,
  Wallet,
  Bell,
  HeadphonesIcon,
  HelpCircle,
  FileText,
  Sparkles,
  Car,
  Compass,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Settings,
  Flame,
  Receipt,
} from 'lucide-react';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useAddressStore } from '../../store/useAddressStore';
import { useThemeStore } from '../../store/useThemeStore';
import { motion } from 'motion/react';

export default function AppSidebar() {
  const { isOpen, closeSidebar } = useSidebarStore();
  const { user, profile, activeRole, roles, signOut, signInWithGoogle, setActiveRole } = useAuthStore();
  const { currentLocation, openModal: openLocationModal, requestGpsLocation, gpsLoading } = useLocationStore();
  const { openPicker: openMapPicker } = useAddressStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  // Global Theme Store with Supabase Profile persistence
  const { theme, isDark, isSyncing, setTheme, toggleTheme } = useThemeStore();

  const handleLanguageChange = (lang: 'ku' | 'ar' | 'en') => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
  };

  const handleNavClick = (path: string) => {
    closeSidebar();
    navigate(path);
  };

  const handleSignOut = async () => {
    closeSidebar();
    await signOut();
    navigate('/login');
  };

  if (!isOpen) return null;

  const languages = [
    { code: 'ku', label: 'کوردی', sub: 'سۆرانی', flag: '☀️' },
    { code: 'ar', label: 'العربية', sub: 'عراقي', flag: '🇮🇶' },
    { code: 'en', label: 'English', sub: 'Global', flag: '🇬🇧' },
  ] as const;

  const mainNavItems = [
    {
      path: '/',
      icon: Home,
      labelKu: 'پەڕەی سەرەکی',
      labelAr: 'الرئيسية',
      labelEn: 'Home Feed',
      color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/50',
    },
    {
      path: '/marketplace',
      icon: Store,
      labelKu: 'فرۆشگاکان و بازاڕ',
      labelAr: 'المتاجر والماركت',
      labelEn: 'Marketplace & Stores',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      path: '/#social-feed',
      icon: Flame,
      labelKu: 'پۆست و ئۆفەری سۆشیال میدیا',
      labelAr: 'المنشورات والعروض الحية',
      labelEn: 'Social Posts & Deals',
      badge: 'LIVE',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
    },
    {
      path: '/orders',
      icon: ClipboardList,
      labelKu: 'داواکارییەکانم و بەدواداچوون',
      labelAr: 'طلباتي والتتبع',
      labelEn: 'My Orders & Tracking',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
    },
    {
      path: '/dashboard',
      icon: Crown,
      labelKu: 'داشبۆردی سەرپەرشتیار و کۆنتڕۆڵ',
      labelAr: 'لوحة التحكم والعمليات',
      labelEn: 'HQ Operations & Control',
      badge: activeRole ? activeRole.replace(/_/g, ' ') : 'HQ',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
    },
    {
      path: '/profile',
      icon: User,
      labelKu: 'هەژماری بەکارهێنەر',
      labelAr: 'الملف الشخصي',
      labelEn: 'Profile & Settings',
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/50',
    },
  ];

  const rolePortals = [
    {
      role: 'super_admin',
      labelKu: 'سەرپەرشتیاری گشتی (Super Admin)',
      labelAr: 'المشرف العام (Super Admin)',
      labelEn: 'Super Admin HQ',
      path: '/dashboard?tab=analytics',
      icon: ShieldCheck,
      color: 'text-amber-500',
    },
    {
      role: 'business_owner',
      labelKu: 'پەنێڵی فرۆشگا و کاڵاکان',
      labelAr: 'بوابة المتجر والمنتجات',
      labelEn: 'Merchant Partner Portal',
      path: '/dashboard?tab=products',
      icon: Building2,
      color: 'text-indigo-500',
    },
    {
      role: 'driver',
      labelKu: 'پەنێڵی کاپتنی گەیاندن',
      labelAr: 'بوابة كابتن التوصيل',
      labelEn: 'Captain Driver Hub',
      path: '/dashboard?tab=orders&role=CAPTAIN',
      icon: Bike,
      color: 'text-emerald-500',
    },
    {
      role: 'captain_settlements',
      labelKu: 'حیساباتی کاپتن و پارەی کاش',
      labelAr: 'حسابات الكابتن وتسوية النقد',
      labelEn: 'Captain Cash & Settlements',
      path: '/dashboard?role=CAPTAIN_FINANCE',
      icon: Receipt,
      color: 'text-teal-500',
    },
  ];

  return (
    <div
      id="app-sidebar-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex transition-all duration-300 animate-in fade-in"
      onClick={closeSidebar}
    >
      {/* Sidebar Container */}
      <aside
        id="app-sidebar-panel"
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-slate-900 w-[88vw] max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-hidden border-e border-slate-100 dark:border-slate-800 transition-all transform duration-300 ease-out ${
          isRtl ? 'animate-in slide-in-from-right' : 'animate-in slide-in-from-left'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-rose-500 flex items-center justify-center text-white font-black shadow-md shadow-primary-500/20 text-lg">
              ش
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  SHAKH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300">
                  SuperApp
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {currentLang === 'ku' ? 'هەموو خزمەتگوزارییەکان لە یەک شوێن' : currentLang === 'ar' ? 'جميع الخدمات في مكان واحد' : 'All services in one app'}
              </span>
            </div>
          </div>

          <button
            id="close-sidebar-btn"
            onClick={closeSidebar}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {profile?.full_name || user.email?.split('@')[0] || 'User'}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{user.email || profile?.phone || ''}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Crown className="w-3 h-3" />
                        {activeRole ? activeRole.replace(/_/g, ' ') : 'Customer'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => handleNavClick('/profile')}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                  >
                    <span>{currentLang === 'ku' ? 'بەڕێوەبردنی هەژمار' : currentLang === 'ar' ? 'إدارة الحساب' : 'Manage Profile'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleNavClick('/dashboard')}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>{currentLang === 'ku' ? 'داشبۆرد' : currentLang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {currentLang === 'ku' ? 'بەخێربێیت بۆ شاخ' : currentLang === 'ar' ? 'أهلاً بك في شاخ' : 'Welcome to SHAKH'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {currentLang === 'ku' ? 'بچۆ ژوورەوە بۆ سوودمەندبوون' : currentLang === 'ar' ? 'سجل دخول للوصول لكامل الميزات' : 'Sign in to access all features'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('/login')}
                  className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ku' ? 'چوونەژوور' : currentLang === 'ar' ? 'دخول' : 'Sign In'}</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION: Languages (زمانەکان) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <Globe2 className="w-3.5 h-3.5 text-primary-500" />
              <span>{currentLang === 'ku' ? 'زمان / اللغات / Language' : currentLang === 'ar' ? 'اللغة / Language' : 'Language'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {languages.map((item) => {
                const isActive = currentLang === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleLanguageChange(item.code)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base leading-none">{item.flag}</span>
                    <span className="font-bold text-xs leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight">{item.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION: Location Selection (شوێن) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{currentLang === 'ku' ? 'شوێنی داواکاری و گەیاندن' : currentLang === 'ar' ? 'موقع الطلب والتوصيل' : 'Delivery Location'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                    {currentLocation.displayLabel || 'Erbil, KR'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentLocation.isGps
                      ? currentLang === 'ku' ? 'شوێنی ڕاستەقینە (GPS)' : 'موقع GPS مباشر'
                      : currentLang === 'ku' ? 'دیاریکراوی دەستی' : 'تحديد يدوي'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    closeSidebar();
                    openMapPicker(null);
                  }}
                  title={currentLang === 'ku' ? 'دیاریکردن لەسەر نەخشە' : 'Pin on Map'}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-primary-600 dark:text-primary-400 hover:bg-rose-100 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    closeSidebar();
                    requestGpsLocation(currentLang);
                  }}
                  disabled={gpsLoading}
                  title="GPS"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                >
                  <Compass className={`w-4 h-4 ${gpsLoading ? 'animate-spin text-primary-600' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    closeSidebar();
                    openLocationModal();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {currentLang === 'ku' ? 'گۆڕین' : currentLang === 'ar' ? 'تغيير' : 'Change'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: Theme & Display (شێوازی ڕووکار / المظهر والسمة) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {isDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{currentLang === 'ku' ? 'شێوازی ڕووکار' : currentLang === 'ar' ? 'المظهر والسمة' : 'Theme Mode'}</span>
              </div>
              {user && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {isSyncing ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  )}
                  <span>
                    {isSyncing
                      ? currentLang === 'ku' ? 'پاشەکەوت دەکرێت...' : currentLang === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                      : currentLang === 'ku' ? 'هاوکات لە پرۆفایل' : currentLang === 'ar' ? 'محفوظ في الملف' : 'Profile Synced'}
                  </span>
                </span>
              )}
            </div>

            <div className="relative p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-1">
              <button
                type="button"
                id="sidebar-theme-light-btn"
                onClick={() => setTheme('light', user?.id)}
                className={`relative z-10 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                  !isDark
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {!isDark && (
                  <motion.div
                    layoutId="sidebar-theme-pill"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-amber-200 dark:border-slate-600"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Sun className={`relative z-10 w-4 h-4 ${!isDark ? 'text-amber-500 fill-amber-400/30' : 'text-slate-400'}`} />
                <span className="relative z-10">
                  {currentLang === 'ku' ? 'ڕووناک' : currentLang === 'ar' ? 'فاتح' : 'Light'}
                </span>
              </button>

              <button
                type="button"
                id="sidebar-theme-dark-btn"
                onClick={() => setTheme('dark', user?.id)}
                className={`relative z-10 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${
                  isDark
                    ? 'text-indigo-900 dark:text-indigo-100'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isDark && (
                  <motion.div
                    layoutId="sidebar-theme-pill"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-indigo-500/40"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <Moon className={`relative z-10 w-4 h-4 ${isDark ? 'text-indigo-400 fill-indigo-400/30' : 'text-slate-400'}`} />
                <span className="relative z-10">
                  {currentLang === 'ku' ? 'تاریک' : currentLang === 'ar' ? 'داكن' : 'Dark'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION: Main Navigation Links */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {currentLang === 'ku' ? 'خزمەتگوزارییە سەرەکییەکان' : currentLang === 'ar' ? 'الخدمات الرئيسية' : 'Main Services'}
            </div>

            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const label = currentLang === 'ku' ? item.labelKu : currentLang === 'ar' ? item.labelAr : item.labelEn;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full text-start p-2.5 rounded-2xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold border border-primary-200/60 dark:border-primary-800/60 shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:text-primary-500 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION: Management & Role Portals */}
          {user && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                {currentLang === 'ku' ? 'بەشەکانی بەڕێوەبردن' : currentLang === 'ar' ? 'بوابات الإدارة' : 'Portals & Roles'}
              </div>

              <div className="space-y-1">
                {rolePortals.map((portal) => {
                  const Icon = portal.icon;
                  const label = currentLang === 'ku' ? portal.labelKu : currentLang === 'ar' ? portal.labelAr : portal.labelEn;

                  return (
                    <button
                      key={portal.role}
                      onClick={() => handleNavClick(portal.path)}
                      className="w-full text-start p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${portal.color}`} />
                        <span className="text-xs font-semibold">{label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:text-primary-500 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION: Quick Help & Support */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {currentLang === 'ku' ? 'پشتگیری و یاساکان' : currentLang === 'ar' ? 'الدعم والمعلومات' : 'Support & Info'}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  closeSidebar();
                  alert(currentLang === 'ku' ? 'پەیوەندی بە پشتگیری شاخ: 0750 000 0000' : 'الاتصال بالدعم الفني: 0750 000 0000');
                }}
                className="w-full text-start p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <HeadphonesIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs">{currentLang === 'ku' ? 'پشتگیری و پەیوەندی ٢٤/٧' : currentLang === 'ar' ? 'مركز الدعم والمساعدة ٢٤/٧' : '24/7 Support Center'}</span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold">
                  {currentLang === 'ku' ? 'چالاکە' : 'متاح'}
                </span>
              </button>

              <button
                onClick={() => {
                  closeSidebar();
                  alert(currentLang === 'ku' ? 'سوپەر ئەپی شاخ - سیستەمی گشتگیری بازرگانی و گەیاندن لە هەرێمی کوردستان و عێراق' : 'تطبيق شاخ الشامل لخدمات التجارة والتوصيل في كوردستان والعراق');
                }}
                className="w-full text-start p-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs">{currentLang === 'ku' ? 'یاسا، مەرجەکان و تایبەتمەندی' : currentLang === 'ar' ? 'الشروط والأحكام والخصوصية' : 'Terms & Privacy'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 space-y-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200/60 dark:border-rose-800/60"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentLang === 'ku' ? 'چوونەدەرەوە لە هەژمار' : currentLang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={async () => {
                  closeSidebar();
                  await signInWithGoogle('sardar.xano59@gmail.com', 'Sardar Xano');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2.5 shadow-xs border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{currentLang === 'ku' ? 'چوونەژوورەوە بە گووگڵ (Google)' : currentLang === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign In with Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{currentLang === 'ku' ? 'چوونەژوورەوە / دروستکردنی هەژمار' : currentLang === 'ar' ? 'تسجيل الدخول / حساب جديد' : 'Sign In / Register'}</span>
              </button>
            </div>
          )}

          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              SHAKH Super App v2.4.0 • Kurdistan & Iraq
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
