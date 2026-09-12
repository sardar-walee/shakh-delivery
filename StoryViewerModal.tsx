import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Heart, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostStory } from '../../types/post';
import { useSocialStore } from '../../store/useSocialStore';

interface StoryViewerModalProps {
  story: PostStory | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryViewerModal({ story, isOpen, onClose }: StoryViewerModalProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language !== 'en';
  const stories = useSocialStore((state) => state.stories);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Move to next story or close if last
  const goToNextStory = useCallback(() => {
    if (!story) return;
    const { stories: allStories, openStory } = useSocialStore.getState();
    const currentIdx = allStories.findIndex((s) => s.id === story.id);
    if (currentIdx !== -1 && currentIdx < allStories.length - 1) {
      openStory(allStories[currentIdx + 1]);
    } else {
      onClose();
    }
  }, [story, onClose]);

  // Move to previous story
  const goToPrevStory = useCallback(() => {
    if (!story) return;
    const { stories: allStories, openStory } = useSocialStore.getState();
    const currentIdx = allStories.findIndex((s) => s.id === story.id);
    if (currentIdx > 0) {
      openStory(allStories[currentIdx - 1]);
    }
  }, [story]);

  // Reset progress & liked state when switching stories
  useEffect(() => {
    setProgress(0);
    setLiked(false);
  }, [story?.id]);

  // Pure progress timer without side effects in updater
  useEffect(() => {
    if (!isOpen || !story || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(prev + 2, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, story?.id, isPaused]);

  // Advance story strictly inside a committed effect when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && isOpen && story) {
      goToNextStory();
    }
  }, [progress, isOpen, story, goToNextStory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (isRtl) {
          goToPrevStory();
        } else {
          goToNextStory();
        }
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) {
          goToNextStory();
        } else {
          goToPrevStory();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRtl, goToNextStory, goToPrevStory, onClose]);

  if (!isOpen || !story) return null;

  const currentIdx = stories.findIndex((s) => s.id === story.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx !== -1 && currentIdx < stories.length - 1;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const msg = encodeURIComponent(`🏔️ شاخ ستۆری (${story.author_name}): ${replyText}`);
    try {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    } catch {
      // Fallback if blocked
    }
    setReplyText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md h-full sm:h-[86vh] sm:rounded-3xl bg-slate-950 overflow-hidden flex flex-col justify-between shadow-2xl select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Multi-story Segmented Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5">
          {stories.map((s, idx) => {
            let barWidth = 0;
            if (idx < currentIdx) {
              barWidth = 100;
            } else if (idx === currentIdx) {
              barWidth = progress;
            }
            return (
              <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Story Header */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={story.author_avatar}
              alt={story.author_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-500 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-sm font-bold text-white shadow-xs drop-shadow-md">
                {story.author_name}
              </h4>
              <span className="text-[11px] text-white/80 drop-shadow-md">
                {isRtl ? 'ستۆری نوێی ئەمڕۆ' : 'Today story'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
            aria-label="Close story"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media with Interactive Tap Zones for Prev/Next */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <img
            src={story.media_url}
            alt={story.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Left tap zone */}
          <button
            type="button"
            onClick={() => (isRtl ? goToNextStory() : goToPrevStory())}
            className="absolute inset-y-16 start-0 w-1/3 z-10 focus:outline-none cursor-pointer"
            aria-label="Previous story"
          />

          {/* Right tap zone */}
          <button
            type="button"
            onClick={() => (isRtl ? goToPrevStory() : goToNextStory())}
            className="absolute inset-y-16 end-0 w-1/3 z-10 focus:outline-none cursor-pointer"
            aria-label="Next story"
          />

          {/* Nav Chevrons (visible on hover) */}
          {hasPrev && (
            <button
              type="button"
              onClick={goToPrevStory}
              className={`hidden sm:flex absolute ${isRtl ? 'end-2' : 'start-2'} top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-colors`}
              aria-label="Previous story"
            >
              {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={goToNextStory}
              className={`hidden sm:flex absolute ${isRtl ? 'start-2' : 'end-2'} top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-colors`}
              aria-label="Next story"
            >
              {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}

          {/* Story Caption Overlay */}
          <div className="absolute bottom-20 inset-x-4 z-20 text-white space-y-1 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-600/90 text-white text-xs font-bold shadow-md pointer-events-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{story.title}</span>
            </div>
          </div>
        </div>

        {/* Bottom Reaction and Reply Bar */}
        <div className="p-3 bg-black/60 backdrop-blur-md border-t border-white/10 z-30 flex items-center gap-2">
          <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder={isRtl ? 'وەڵامدانەوە لە واتس ئاپ...' : 'Reply on WhatsApp...'}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors"
              title="Send to WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => setLiked(!liked)}
            className={`p-2.5 rounded-full transition-transform active:scale-125 cursor-pointer ${
              liked ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
