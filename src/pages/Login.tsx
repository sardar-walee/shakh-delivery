import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationStore } from '../store/useLocationStore';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Crown, Sparkles } from 'lucide-react';
import { toast } from '../store/useToastStore';

type AuthMode = 'login' | 'register' | 'forgot_password';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuthStore();
  const { openModal } = useLocationStore();
  const isRtl = i18n.language !== 'en';
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err?.message || 'Google sign in failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If the account does not exist yet on Supabase Auth, auto-create it seamlessly
          if (
            signInError.message?.toLowerCase().includes('invalid login credentials') ||
            signInError.message?.toLowerCase().includes('invalid grant') ||
            signInError.message?.toLowerCase().includes('user not found')
          ) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: email.toLowerCase() === 'shakh8002@gmail.com' ? 'Super Admin (Shakh)' : 'User',
                },
              },
            });

            if (!signUpError && signUpData.user) {
              openModal();
              navigate('/');
              return;
            }
          }
          throw signInError;
        }

        openModal();
        navigate('/');
      } else if (mode === 'register') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user) {
          openModal();
          navigate('/');
        }
      } else if (mode === 'forgot_password') {
        // Send password recovery email via Supabase
        const resetRedirectUrl = `${window.location.origin}/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetRedirectUrl,
        });

        if (resetError) throw resetError;

        setResetSent(true);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-muted dark:bg-surface-muted-dark p-6">
      <div className="w-full max-w-md card shadow-xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30 text-white">
            {mode === 'forgot_password' ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <span className="text-2xl font-bold font-display">ش</span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {mode === 'login' && (isRtl ? 'چوونە ژوورەوە بۆ شاخ ستۆر' : 'Sign in to SHAKH Store')}
            {mode === 'register' && (isRtl ? 'دروستکردنی هەژماری نوێ' : 'Create SHAKH Store Account')}
            {mode === 'forgot_password' && t('forgot_password')}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {mode === 'forgot_password' 
              ? t('forgot_password_desc')
              : (isRtl ? 'شاخ ستۆر (SHAKH Store) - بازاڕ و فرۆشگاکانی کوردستان' : 'SHAKH Store - Kurdistan Marketplace & Stores')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Google Sign-In Option */}
        {mode !== 'forgot_password' && !resetSent && (
          <div className="space-y-3 mb-5">
            <button
              id="google-signin-btn"
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-bold text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs active:scale-98 cursor-pointer group disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isRtl ? 'چوونە ژوورەوە بە گووگڵ (Google)' : 'Sign in with Google'}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                {isRtl ? 'یان بە هەژماری ئیمەیڵ' : 'or with email'}
              </span>
            </div>
          </div>
        )}

        {mode === 'forgot_password' && resetSent ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('reset_email_sent_title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {t('reset_email_sent_desc')}
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 break-all mt-2">
                {email}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <span>{t('back_to_login')}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
              
              <button
                type="button"
                onClick={() => setResetSent(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-2 font-medium"
              >
                Try with a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('full_name')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setMode('forgot_password');
                      }}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t('forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field ltr:pr-10 rtl:pl-10"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 shadow-lg shadow-primary-500/20"
            >
              {loading
                ? t('loading')
                : mode === 'forgot_password'
                ? t('send_reset_link')
                : t('submit')}
            </button>
          </form>
        )}

        <div className="mt-6 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          {mode === 'forgot_password' ? (
            <button
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium hover:text-primary-600 text-sm"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('back_to_login')}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setError(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm"
            >
              {mode === 'login'
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
