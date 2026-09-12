import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language !== 'en';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a session or recovery token
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check hash fragments for recovery tokens
      const hash = window.location.hash;
      const isRecovery = hash.includes('type=recovery') || hash.includes('access_token=');

      if (session || isRecovery) {
        setHasValidSession(true);
      } else {
        // Still allow them to attempt if Supabase client already caught the token
        setHasValidSession(true);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwords_dont_match', 'Passwords do not match.'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_too_short', 'Password must be at least 6 characters.'));
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to update password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-muted dark:bg-surface-muted-dark p-6">
      <div className="w-full max-w-md card shadow-xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-600/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 border border-primary-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {t('reset_password')}
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {t('reset_password_desc')}
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('password_updated_success')}
              </h3>
              <p className="text-xs text-slate-500">
                Redirecting to login in 3 seconds...
              </p>
            </div>
            <Link
              to="/login"
              className="btn-primary inline-flex items-center gap-2 justify-center w-full"
            >
              <span>{t('login')}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-900/50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('new_password')}
              </label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t('confirm_password')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-3.5 h-3.5 ${password.length >= 6 ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>At least 6 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-3.5 h-3.5 ${password && password === confirmPassword ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>Passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-lg shadow-primary-600/20"
            >
              {loading ? t('loading') : t('update_password')}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
              >
                {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{t('back_to_login')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
