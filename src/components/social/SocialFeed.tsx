import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Search,
  Filter,
  Flame,
  UtensilsCrossed,
  Store,
  Shirt,
  Heart,
  Plus,
  Compass,
} from 'lucide-react';
import { useSocialStore } from '../../store/useSocialStore';
import StoriesBar from './StoriesBar';
import PostCard from './PostCard';
import PostDetailModal from './PostDetailModal';
import ShareModal from './ShareModal';
import StoryViewerModal from './StoryViewerModal';
import CreatePostModal from './CreatePostModal';

interface SocialFeedProps {
  showStories?: boolean;
  limit?: number;
  standalone?: boolean;
}

export default function SocialFeed({ showStories = true, limit, standalone = false }: SocialFeedProps) {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const {
    posts,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    activePost,
    closePostDetail,
    shareModalPost,
    closeShareModal,
    activeStory,
    closeStory,
  } = useSocialStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories = [
    { id: 'all', name: isRtl ? 'هەموو پۆستەکان' : 'All Posts', icon: Compass },
    { id: 'offers', name: isRtl ? 'ئۆفەر و داشکاندن' : 'Special Deals', icon: Flame },
    { id: 'food', name: isRtl ? 'چێشتخانە و خواردن' : 'Food & Dining', icon: UtensilsCrossed },
    { id: 'market', name: isRtl ? 'مارکێت و خواردەمەنی' : 'Supermarket', icon: Store },
    { id: 'fashion', name: isRtl ? 'مۆدە و جلوبەرگ' : 'Fashion', icon: Shirt },
    { id: 'beauty', name: isRtl ? 'عەتر و جوانی' : 'Beauty & Perfume', icon: Heart },
  ];

  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => p.status !== 'pending' && p.status !== 'rejected');

    // Filter by Category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.author.name.toLowerCase().includes(q) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }, [posts, activeCategory, searchQuery, limit]);

  return (
    <section className="space-y-6">
      {/* 1. STORIES SECTION */}
      {showStories && <StoriesBar />}

      {/* 2. FEED HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              {isRtl ? 'پۆست و ئۆفەری دوکانەکان' : 'Store Posts & Live Offers'}
            </h2>
            <p className="text-xs text-slate-500">
              {isRtl
                ? 'کلیک لەسەر پۆستەکان بکە بۆ بینین، لایک و هاوبەشکردن'
                : 'Click any post to view full details, like, and share'}
            </p>
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? 'پۆستی نوێ دابنێ' : 'New Post'}</span>
        </button>
      </div>

      {/* 3. CATEGORY PILLS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category Pills Slider */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Post Search */}
        <div className="relative min-w-[200px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 start-3 my-auto pointer-events-none" />
          <input
            type="text"
            placeholder={isRtl ? 'گەڕان لە پۆستەکان...' : 'Search posts & tags...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 ps-9 pe-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 4. POSTS GRID / LIST */}
      {filteredPosts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {isRtl ? 'هیچ پۆستێک نەدۆزرایەوە' : 'No posts match your filter'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRtl
              ? 'تکایە بەشێکی تر هەڵبژێرە یان گەڕانەکەت بگۆڕە بۆ بینینی ئۆفەرەکانی پلاتفۆرمی شاخ.'
              : 'Try clearing your search or picking another category to explore.'}
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors"
          >
            {isRtl ? 'هەموو پۆستەکان پیشان بدە' : 'Show All Posts'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 5. GLOBAL INTERACTIVE MODALS */}
      {/* FULL POST DETAIL MODAL */}
      <PostDetailModal
        post={activePost}
        isOpen={Boolean(activePost)}
        onClose={closePostDetail}
      />

      {/* 1-CLICK SOCIAL MEDIA SHARE MODAL */}
      <ShareModal
        post={shareModalPost}
        isOpen={Boolean(shareModalPost)}
        onClose={closeShareModal}
      />

      {/* STORY VIEWER MODAL */}
      <StoryViewerModal
        story={activeStory}
        isOpen={Boolean(activeStory)}
        onClose={closeStory}
      />

      {/* CREATE NEW POST MODAL */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </section>
  );
}
