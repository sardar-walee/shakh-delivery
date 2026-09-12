import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Home, Store, ClipboardList, User, Search, Bell, LayoutDashboard, Crown, MapPin, ChevronDown, Menu, ShoppingBag, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocationStore } from '../../store/useLocationStore';
import { useSidebarStore } from '../../store/useSidebarStore';
import { useCartStore } from '../../store/useCartStore';
import { useThemeStore } from '../../store/useThemeStore';
import { subscribeToSupabaseNotifications, addNotificationListener, AppNotification } from '../../lib/notifications';
import { toast } from '../../store/useToastStore';
import LocationSelectModal from '../location/LocationSelectModal';
import DeliveryMapPickerModal from '../location/DeliveryMapPickerModal';
import AppSidebar from './AppSidebar';
import ToastContainer from '../common/ToastContainer';
import CartDrawerModal from '../cart/CartDrawerModal';
import ProductDetailModal from '../product/ProductDetailModal';
import ScheduleOrderModal from '../orders/ScheduleOrderModal';
import { useScheduledOrderStore } from '../../store/useScheduledOrderStore';

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, activeRole, signOut } = useAuthStore();
  const { currentLocation, openModal } = useLocationStore();
  const { openSidebar } = useSidebarStore();
  const { toggleCart, getItemCount } = useCartStore();
  const { isScheduleModalOpen, closeScheduleModal, preselectedCategory } = useScheduledOrderStore();
  const { isDark, toggleTheme } = useThemeStore();
  const isRtl = i18n.language !== 'en';
  const cartCount = getItemCount();

  useEffect(() => {
    // Listen for in-app UI toasts from push/background notification channels
    const unsubscribeToast = addNotificationListener((notif: AppNotification) => {
      toast.info(notif.body, {
        title: notif.title,
        duration: 5000,
      });
    });

    // Subscribe to Supabase realtime channels when logged in
    let unsubscribeRealtime = () => {};
    if (user?.id) {
      unsubscribeRealtime = subscribeToSupabaseNotifications(user.id);
    }

    return () => {
      unsubscribeToast();
      unsubscribeRealtime();
    };
  }, [user?.id]);

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/marketplace', icon: Store, label: t('marketplace') },
    { path: '/orders', icon: ClipboardList, label: t('orders') },
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard', 'داشبۆرد') },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-16 bg-surface-muted dark:bg-surface-muted-dark flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-40 hidden md:flex items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold font-display">ش</span>
            </div>
            <span className="text-xl font-bold font-display text-primary-600 tracking-tight">SHAKH</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Location Selector Pill */}
          <button
            id="desktop-location-btn"
            onClick={openModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/70 dark:border-slate-700 transition-all max-w-[220px] truncate"
            title={currentLocation.displayLabel}
          >
            <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="truncate">{currentLocation.displayLabel || 'Erbil, KR'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Sidebar Menu Button next to location */}
          <button
            id="desktop-sidebar-toggle-btn"
            onClick={openSidebar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200/60 dark:border-slate-700"
            title="مینیۆی شاخ و زمانەکان / Main Menu & Languages"
          >
            <Menu className="w-4 h-4 text-primary-600" />
            <span>{isRtl ? 'مینیۆ و زمان' : 'Menu'}</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            id="desktop-cart-toggle-btn"
            onClick={toggleCart}
            className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Shopping Cart / سەبەتەی کڕین"
          >
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-scaleIn">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-amber-500/10 dark:text-amber-300 dark:border dark:border-amber-500/30 text-xs font-bold hover:opacity-90 transition-all shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeRole ? activeRole.replace(/_/g, ' ') : 'HQ'}</span>
          </Link>

          <button className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleTheme(user?.id)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          {!user ? (
            <Link to="/login" className="btn-primary py-2 px-4 text-sm ml-2">
              {t('login')}
            </Link>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/profile" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all" title="Profile">
                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <User className="w-5 h-5" />
                </div>
              </Link>
              <button 
                onClick={() => signOut()} 
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Global Location Selection Modal */}
      <LocationSelectModal />

      {/* Global Delivery Map Picker Modal */}
      <DeliveryMapPickerModal />

      {/* Global App Sidebar Drawer */}
      <AppSidebar />

      {/* Global Shopping Cart Drawer */}
      <CartDrawerModal />

      {/* Global Product Detail & Price Trend Modal */}
      <ProductDetailModal />

      {/* Unified Non-Intrusive Toast Container System */}
      <ToastContainer />

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around z-50 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary-50 stroke-primary-600 dark:fill-primary-900/20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

