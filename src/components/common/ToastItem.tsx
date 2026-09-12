import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ShoppingBag,
  Loader2,
  X,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { ToastItem as IToastItem } from '../../types/toast';
import { useToastStore } from '../../store/useToastStore';

interface ToastItemProps {
  toast: IToastItem;
  key?: React.Key;
}

export default function ToastItem({ toast }: ToastItemProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';
  const { dismiss } = useToastStore();

  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 4000);
  const animationFrameRef = useRef<number | null>(null);

  const duration = toast.duration ?? 4000;
  const isAutoDismiss = duration > 0 && toast.type !== 'loading';

  // Handle timer with pause-on-hover support
  useEffect(() => {
    if (!isAutoDismiss) return;

    let timerId: NodeJS.Timeout;

    if (!isPaused) {
      startTimeRef.current = Date.now();

      timerId = setTimeout(() => {
        dismiss(toast.id);
      }, remainingTimeRef.current);

      const updateProgress = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
        const nextProgress = (currentRemaining / duration) * 100;
        setProgress(nextProgress);

        if (currentRemaining > 0) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      clearTimeout(timerId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, isAutoDismiss, duration, toast.id, dismiss]);

  const handleMouseEnter = () => {
    if (!isAutoDismiss) return;
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (!isAutoDismiss) return;
    setIsPaused(false);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe away horizontally
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
      dismiss(toast.id);
    }
  };

  // Type styling details
  const getTypeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-emerald-500/30 dark:border-emerald-500/30',
          accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          barColor: 'bg-emerald-500',
          defaultTitle: isRtl ? 'سەرکەوتوو بوو' : 'Success',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-rose-500/30 dark:border-rose-500/30',
          accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          barColor: 'bg-rose-500',
          defaultTitle: isRtl ? 'هەڵەیەک ڕوویدا' : 'Error',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-amber-500/30 dark:border-amber-500/30',
          accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          barColor: 'bg-amber-500',
          defaultTitle: isRtl ? 'ئاگاداری' : 'Warning',
        };
      case 'cart':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-primary-600 shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-primary-500/40 dark:border-primary-500/30',
          accentBg: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
          barColor: 'bg-primary-600',
          defaultTitle: isRtl ? 'زیادکرا بۆ سەبەتەی کڕین' : 'Added to Cart',
        };
      case 'loading':
        return {
          icon: <Loader2 className="w-5 h-5 text-primary-500 animate-spin shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-slate-300 dark:border-slate-700',
          accentBg: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
          barColor: 'bg-primary-500',
          defaultTitle: isRtl ? 'چاوەڕێ بە...' : 'Loading...',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          bgColor: 'bg-white dark:bg-slate-900',
          borderColor: 'border-sky-500/30 dark:border-sky-500/30',
          accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
          barColor: 'bg-sky-500',
          defaultTitle: isRtl ? 'ئاگادارکردنەوە' : 'Notice',
        };
    }
  };

  const config = getTypeConfig();
  const title = toast.title || config.defaultTitle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-live="polite"
      className={`relative w-full max-w-sm sm:max-w-md ${config.bgColor} rounded-2xl shadow-xl border ${config.borderColor} overflow-hidden backdrop-blur-md transition-shadow select-none group pointer-events-auto`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Custom Icon / Product Image / Type Icon */}
        <div className="shrink-0 mt-0.5">
          {toast.cartDetails?.image ? (
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
              <img
                src={toast.cartDetails.image}
                alt={toast.cartDetails.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {toast.cartDetails.quantity && toast.cartDetails.quantity > 1 && (
                <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto bg-primary-600 text-white text-[10px] font-black rounded-full px-1.5 min-w-[18px] text-center shadow-xs">
                  {toast.cartDetails.quantity}
                </span>
              )}
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.accentBg}`}>
              {toast.icon || config.icon}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
              {title}
            </h5>
            {toast.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-100 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300">
                {toast.badge}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Action Buttons */}
          {(toast.action || toast.secondaryAction) && (
            <div className="flex items-center gap-2 mt-2.5 pt-1">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismiss(toast.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <span>{toast.action.label}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </button>
              )}

              {toast.secondaryAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.secondaryAction?.onClick();
                    dismiss(toast.id);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                >
                  {toast.secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {toast.dismissible && (
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-Dismiss Progress Bar Countdown */}
      {isAutoDismiss && (
        <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full ${config.barColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
