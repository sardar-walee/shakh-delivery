import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building,
  Navigation,
  Trash2,
  Edit2,
  CheckCircle2,
  Star,
  Compass,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { useAddressStore } from '../../store/useAddressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DeliveryAddress } from '../../types/address.types';
import { toast } from '../../store/useToastStore';

export default function SavedDeliveryAddresses() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const { user } = useAuthStore();
  const {
    addresses,
    loadUserAddresses,
    openPicker,
    deleteAddress,
    setDefaultAddress,
    selectAddressForDelivery,
    selectedAddress,
    loading
  } = useAddressStore();

  useEffect(() => {
    loadUserAddresses(user?.id);
  }, [user?.id, loadUserAddresses]);

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'work':
        return <Briefcase className="w-4 h-4 text-amber-500" />;
      case 'office':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'other':
        return <Compass className="w-4 h-4 text-purple-500" />;
      case 'home':
      default:
        return <Home className="w-4 h-4 text-primary-500" />;
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {currentLang === 'ku'
                ? 'ناونیشانەکانی گەیاندن و نەخشە'
                : currentLang === 'ar'
                ? 'عناوين التوصيل والخريطة'
                : 'Saved Delivery Addresses & Map'}
            </h3>
            <p className="text-xs text-slate-400">
              {currentLang === 'ku'
                ? 'شوێنی ماڵ یان ئۆفیسەکەت لەسەر نەخشە دیاریبکە بۆ خێرا گەیشتن'
                : currentLang === 'ar'
                ? 'حدد مواقع التوصيل على الخريطة لتسهيل استلام الطلبات'
                : 'Manage your pinned delivery points for faster checkout'}
            </p>
          </div>
        </div>

        {/* Add New Address Button */}
        <button
          id="add-delivery-address-btn"
          onClick={() => openPicker(null)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{currentLang === 'ku' ? 'زیادکردنی ناونیشان' : currentLang === 'ar' ? 'إضافة عنوان' : 'Add Address'}</span>
        </button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">
            {currentLang === 'ku'
              ? 'هیچ ناونیشانێکی گەیاندن تۆمار نەکراوە'
              : currentLang === 'ar'
              ? 'لم يتم حفظ أي عنوان توصيل بعد'
              : 'No delivery addresses saved yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            {currentLang === 'ku'
              ? 'ناونیشانی ماڵ یان ئۆفیسەکەت بە بەکارهێنانی GPS لەسەر نەخشە دیاریبکە بۆ داواکارییەکانت.'
              : currentLang === 'ar'
              ? 'حدد موقعك عبر نظام GPS والخريطة لتوصيل سريع لطلباتك.'
              : 'Pin your home or office on the map using GPS for smooth orders.'}
          </p>
          <button
            onClick={() => openPicker(null)}
            className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2"
          >
            <Crosshair className="w-4 h-4" />
            <span>{currentLang === 'ku' ? 'دیاریکردن لەسەر نەخشە (GPS)' : 'Set Location on Map'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const isCurrentlySelected = selectedAddress?.id === addr.id;

            return (
              <div
                key={addr.id}
                className={`p-4 rounded-2xl border transition-all ${
                  addr.is_default
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-primary-300 dark:border-primary-800'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getTagIcon(addr.tag)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {addr.title}
                        </span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
                            <span>{currentLang === 'ku' ? 'سەرەکی' : currentLang === 'ar' ? 'الرئيسي' : 'Default'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {addr.street_address}
                        {addr.building_name ? ` • ${addr.building_name}` : ''}
                        {addr.floor_apartment ? ` • ${addr.floor_apartment}` : ''}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                        <span>
                          {addr.city} {addr.district ? `(${addr.district})` : ''}
                        </span>
                        {addr.nearest_landmark && (
                          <span>
                            📍 {currentLang === 'ku' ? 'نیشانە:' : 'Landmark:'} {addr.nearest_landmark}
                          </span>
                        )}
                        {addr.phone_contact && <span>📞 {addr.phone_contact}</span>}
                      </div>

                      {addr.driver_instructions && (
                        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                          📝 <span className="italic">{addr.driver_instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openPicker(addr)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={async () => {
                        await deleteAddress(addr.id, user?.id);
                        toast.info(
                          currentLang === 'ku'
                            ? `ناونیشانی "${addr.title}" سڕایەوە`
                            : `Address "${addr.title}" removed.`
                        );
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Bar: Set default or select for current active delivery */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {!addr.is_default ? (
                    <button
                      onClick={async () => {
                        await setDefaultAddress(addr.id, user?.id);
                        toast.success(
                          currentLang === 'ku'
                            ? `"${addr.title}" وەک ناونیشانی سەرەکی دیاریکرا`
                            : `"${addr.title}" set as your default address.`
                        );
                      }}
                      className="text-[11px] text-slate-500 hover:text-primary-600 font-semibold transition-colors"
                    >
                      {currentLang === 'ku'
                        ? 'دیاریکردن وەک ناونیشانی سەرەکی'
                        : currentLang === 'ar'
                        ? 'تعيين كعنوان رئيسي'
                        : 'Set as Default'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-primary-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ku' ? 'ناونیشانی سەرەکییە' : 'Active Default Address'}</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      selectAddressForDelivery(addr);
                      toast.success(
                        currentLang === 'ku'
                          ? `شوێنی گەیاندنی داواکاری دیاریکرا: ${addr.title}`
                          : `Delivery location set to: ${addr.title} 📍`
                      );
                    }}
                    className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>{currentLang === 'ku' ? 'بەکارهێنان بۆ داواکاری ئێستا' : 'Deliver Here Now'}</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
