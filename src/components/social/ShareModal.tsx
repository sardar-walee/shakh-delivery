import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Post, SocialPlatform } from '../../types/post';
import { sharePostToPlatform, generatePostShareMessage } from '../../utils/socialShare';
import { useSocialStore } from '../../store/useSocialStore';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ post, isOpen, onClose }: ShareModalProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';
  const { incrementShareCount } = useSocialStore();

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const { title, text, url } = generatePostShareMessage(post, currentLang);

  const handleShare = async (platform: SocialPlatform) => {
    incrementShareCount(post.id);
    const result = await sharePostToPlatform(post, platform, currentLang);

    if (platform === 'copy_link' || result.platform === 'copy_link') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      setToastMessage(isRtl ? 'لینکی پۆست کۆپیکرا بۆ کلیپبۆرد!' : 'Post link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } else if (result.message) {
      setToastMessage(result.message);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const platforms: {
    id: SocialPlatform;
    name: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
  }[] = [
    {
      id: 'whatsapp',
      name: 'واتس ئاپ (WhatsApp)',
      icon: '💬',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60',
      border: 'border-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'telegram',
      name: 'تێلێگرام (Telegram)',
      icon: '✈️',
      color: 'text-sky-700 dark:text-sky-300',
      bg: 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60',
      border: 'border-sky-300 dark:border-sky-800',
    },
    {
      id: 'facebook',
      name: 'فەیسبووک (Facebook)',
      icon: '🌐',
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60',
      border: 'border-blue-300 dark:border-blue-800',
    },
    {
      id: 'messenger',
      name: 'مەسنجەر (Messenger)',
      icon: '⚡',
      color: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60',
      border: 'border-indigo-300 dark:border-indigo-800',
    },
    {
      id: 'viber',
      name: 'ڤایبەر (Viber)',
      icon: '💜',
      color: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60',
      border: 'border-purple-300 dark:border-purple-800',
    },
    {
      id: 'x',
      name: 'توییتەر / ئێکس (X)',
      icon: '𝕏',
      color: 'text-slate-800 dark:text-slate-200',
      bg: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
      border: 'border-slate-300 dark:border-slate-700',
    },
    {
      id: 'instagram',
      name: 'ئینستاگرم (Instagram)',
      icon: '📸',
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60',
      border: 'border-rose-300 dark:border-rose-800',
    },
    {
      id: 'native_share',
      name: isRtl ? 'سیستمی هاوبەشکردنی مۆبایل' : 'Device Share Sheet',
      icon: '📲',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60',
      border: 'border-amber-300 dark:border-amber-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isRtl ? 'هاوبەشکردن لە سۆشیال میدیا' : 'Share to Social Media'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRtl ? 'پۆستەکە بە یەک کلیک لەگەڵ هاوڕێکانت هاوبەش بکە' : 'Share this post instantly with friends'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Toast Notice */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </motion.div>
          )}

          {/* Post Preview Mini Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5">
            <img
              src={post.images[0]}
              alt={post.title || post.author.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {post.author.name}
                </span>
                {post.author.verified && (
                  <span className="text-[10px] text-primary-600 font-extrabold">✓</span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {post.title || post.content}
              </p>
            </div>
          </div>

          {/* Direct Copy Link Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isRtl ? 'لینکی ڕاستەوخۆی پۆست' : 'Direct Post Link'}
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rtl:pr-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono text-slate-500 truncate flex-1 select-all">
                {url}
              </span>
              <button
                type="button"
                onClick={() => handleShare('copy_link')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isRtl ? 'کۆپیکرا ✓' : 'Copied!') : (isRtl ? 'کۆپیکردن' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Platforms Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isRtl ? 'هەڵبژاردنی تۆڕی کۆمەڵایەتی' : 'Choose Platform to Share'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleShare(p.id)}
                  className={`p-3 rounded-2xl border ${p.border} ${p.bg} transition-all flex items-center gap-3 text-start group active:scale-98`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs font-bold block truncate ${p.color}`}>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isRtl ? 'هاوبەشکردن' : 'Share'}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            {isRtl ? 'داخستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
