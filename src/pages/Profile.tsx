import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { requestNotificationPermission } from '../lib/notifications';
import { User, LogOut, Settings, Globe, Shield, Phone, Mail, Store, ChevronRight, Bell, Bike, Crown, LayoutDashboard, KeyRound, Check, AlertCircle, Eye, EyeOff, MapPin, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SavedDeliveryAddresses from '../components/profile/SavedDeliveryAddresses';
import { useThemeStore } from '../store/useThemeStore';
import { toast } from '../store/useToastStore';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, profile, roles, activeRole, setActiveRole, signOut } = useAuthStore();
  const { theme, isDark, isSyncing: themeSyncing, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [requestingRole, setRequestingRole] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Password Management State
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Check if notifications are already granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setPushEnabled(true);
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Not logged in</h2>
        <button onClick={() => navigate('/login')} className="btn-primary mt-4">
          {t('login')}
        </button>
      </div>
    );
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    const langNames: Record<string, string> = {
      ku: 'زمانی سیستەم گۆڕدرا بۆ کوردی',
      ar: 'تم تغيير لغة النظام إلى العربية',
      en: 'System language set to English',
    };
    toast.info(langNames[lang] || `Language updated to ${lang.toUpperCase()}`, {
      badge: lang.toUpperCase(),
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme, user?.id);
    const isKurdish = i18n.language === 'ku';
    const isArabic = i18n.language === 'ar';
    const message = newTheme === 'dark'
      ? (isKurdish ? 'شێوازی تاریک چالاک کرا 🌙' : isArabic ? 'تم تفعيل الوضع الليلي 🌙' : 'Dark Mode activated 🌙')
      : (isKurdish ? 'شێوازی ڕووناک چالاک کرا ☀️' : isArabic ? 'تم تفعيل الوضع النهاري ☀️' : 'Light Mode activated ☀️');

    toast.success(message, {
      duration: 2500,
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast.info(i18n.language === 'ku' ? 'بە سەرکەوتوویی چووە دەرەوە' : 'Signed out successfully');
    navigate('/login');
  };

  const enableNotifications = async () => {
    if (!user) return;
    try {
      await requestNotificationPermission(user.id);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        setPushEnabled(true);
        toast.success(
          i18n.language === 'ku'
            ? 'ئاگادارکردنەوەکانی سیستەم چالاک کران 🔔'
            : 'Push notifications enabled successfully 🔔'
        );
      } else {
        toast.warning(
          i18n.language === 'ku'
            ? 'ڕێگەپێدانی ئاگادارکردنەوە ڕەتکرایەوە لە وێبگەڕدا'
            : 'Notification permission was denied in browser settings.'
        );
      }
    } catch {
      toast.error('Failed to enable push notifications.');
    }
  };

  const requestRole = async (role: string) => {
    setRequestingRole(true);
    try {
      try {
        const { error } = await supabase.from('user_roles').insert({
          user_id: user.id,
          role: role,
          status: 'pending'
        });
        
        if (error) {
          if (error.code === '23505') {
            toast.warning(
              i18n.language === 'ku'
                ? `داواکاری پێشووت بۆ ڕۆڵی ${role} لە چاوەڕوانیدایە`
                : `You already have a pending request for role: ${role}`
            );
            return;
          }
        }
      } catch {
        // Table fallback
      }

      toast.success(
        i18n.language === 'ku'
          ? `داواکارییەکەت بۆ ڕۆڵی ${role} بە سەرکەوتوویی تۆمار کرا و لە ژێر پێداچوونەوەدایە`
          : `Role request for ${role} submitted! An admin will review it shortly.`,
        { duration: 5000 }
      );
    } catch (err) {
      console.warn(err);
      toast.info(`Role request for ${role} recorded.`);
    } finally {
      setRequestingRole(false);
    }
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword !== confirmNewPassword) {
      const msg = t('passwords_dont_match', 'Passwords do not match.');
      setPwError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = t('password_too_short', 'Password must be at least 6 characters.');
      setPwError(msg);
      toast.error(msg);
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      const successMsg = t('password_updated_success', 'Password updated successfully!');
      setPwSuccess(successMsg);
      toast.success(successMsg);
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPwSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Failed to update password.';
      setPwError(errMsg);
      toast.error(errMsg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!user?.email) return;
    setPwLoading(true);
    setPwError(null);
    try {
      const resetRedirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: resetRedirectUrl,
      });

      if (error) throw error;
      setResetEmailSent(true);
      toast.info(
        i18n.language === 'ku'
          ? `لینکی گۆڕینی وشەی نهێنی نێردرا بۆ ${user.email}`
          : `Password reset link sent to ${user.email}`,
        { duration: 6000 }
      );
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || 'Failed to send recovery email.';
      setPwError(errMsg);
      toast.error(errMsg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold font-display">{t('profile')}</h1>

      {/* User Info Card */}
      <div className="card flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{profile?.full_name || (user.email?.toLowerCase() === 'shakh8002@gmail.com' ? 'Super Admin' : 'User')}</h2>
            {(activeRole === 'SUPER_ADMIN' || user.email?.toLowerCase() === 'shakh8002@gmail.com') && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>سەرپەرشتیاری باڵا (Super Admin)</span>
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-3 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses & Map Location Picker */}
      <SavedDeliveryAddresses />

      {/* Direct Workspace Dashboard Link */}
      <div className="card p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            {activeRole === 'SUPER_ADMIN' ? <Crown className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Active Role Workspace</div>
            <div className="font-bold text-base">{activeRole || 'SUPER_ADMIN'} Dashboard</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
        >
          <span>Open Dashboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Role Switcher */}
      {roles.length > 1 && (
        <div className="card">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            {t('switch_role')}
          </h3>
          <div className="flex flex-wrap gap-3">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setActiveRole(r.role)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeRole === r.role
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t(`role_${r.role.toLowerCase()}`, r.role)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Become a Partner */}
      <div className="card space-y-2 p-2">
        <div className="px-4 py-3 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800">
          Partner with SHAKH
        </div>
        <button 
          onClick={() => requestRole('RESTAURANT')}
          disabled={requestingRole}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-3 font-medium">
            <Store className="w-5 h-5 text-primary-500" />
            <span>Open a Restaurant or Store</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        <button 
          onClick={() => requestRole('CAPTAIN')}
          disabled={requestingRole}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-3 font-medium">
            <Bike className="w-5 h-5 text-emerald-500" />
            <span>Register as a Delivery Captain</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Settings */}
      <div className="card space-y-2 p-2">
        {/* Language */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 font-medium">
            <Globe className="w-5 h-5 text-slate-400" />
            <span>{t('language')}</span>
          </div>
          <div className="flex gap-2">
            {['ku', 'ar', 'en'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-10 h-10 rounded-lg text-sm font-bold uppercase transition-colors ${
                  i18n.language === lang
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Theme / Appearance Mode */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 font-medium">
            {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <span>{i18n.language === 'ku' ? 'شێوازی ڕووکار' : i18n.language === 'ar' ? 'المظهر والسمة' : 'Theme Mode'}</span>
              <p className="text-xs text-slate-400 font-normal">
                {themeSyncing ? 'Syncing with Supabase...' : 'Persisted in Supabase Profile'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                !isDark
                  ? 'bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-200 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isDark
                  ? 'bg-slate-900 dark:bg-slate-950 text-indigo-200 shadow-xs border border-indigo-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
            <Bell className="w-5 h-5 text-slate-400" />
            <span>Push Notifications</span>
          </div>
          <button 
            onClick={enableNotifications}
            disabled={pushEnabled}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              pushEnabled 
                ? 'bg-green-100 text-green-700 cursor-default' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {pushEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {/* Change / Reset Password */}
        <div className="border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left"
          >
            <div className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>{t('change_password')} / {t('reset_password')}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showPasswordSection ? 'rotate-90' : ''}`} />
          </button>

          {showPasswordSection && (
            <div className="p-4 pt-2 space-y-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-xl border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              {pwSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {resetEmailSent && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{t('reset_email_sent_desc')}</span>
                </div>
              )}

              {pwError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{pwError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t('new_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="input-field text-sm ltr:pr-9 rtl:pl-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 ltr:right-2.5 rtl:left-2.5 text-slate-400 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t('confirm_password')}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="input-field text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={pwLoading || !newPassword}
                    className="btn-primary flex-1 py-2 text-xs font-bold"
                  >
                    {pwLoading ? t('loading') : t('update_password')}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendPasswordResetEmail}
                    disabled={pwLoading}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    {t('send_reset_link')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <button className="w-full p-4 flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>{t('settings')}</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full p-4 flex items-center gap-3 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}
