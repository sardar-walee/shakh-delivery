import { useSocialStore } from '../../store/useSocialStore';
import { useTranslation } from 'react-i18next';
import { Sparkles, Plus } from 'lucide-react';

export default function StoriesBar() {
  const { stories, openStory } = useSocialStore();
  const { i18n } = useTranslation();
  const isRtl = i18n.language !== 'en';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span>{isRtl ? 'ستۆری و دەرکەوتنی دوکانەکان' : 'Store Stories & Live Deals'}</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          {isRtl ? '٢٤ کاتژمێری' : '24h Deals'}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 snap-x hide-scrollbar">
        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => openStory(story)}
            className="flex flex-col items-center gap-1.5 group snap-start focus:outline-none shrink-0"
          >
            <div
              className={`p-[2.5px] rounded-2xl transition-all group-hover:scale-105 group-active:scale-95 ${
                story.has_unread
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-primary-600 shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className="p-0.5 bg-white dark:bg-slate-900 rounded-[14px]">
                <img
                  src={story.author_avatar}
                  alt={story.author_name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[70px] truncate text-center group-hover:text-primary-600 transition-colors">
              {story.author_name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
