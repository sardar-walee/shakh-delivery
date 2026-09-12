import { create } from 'zustand';
import { Post, PostStory, PostComment } from '../types/post';
import { INITIAL_POSTS, INITIAL_STORIES } from '../data/initialPosts';

interface SocialState {
  posts: Post[];
  stories: PostStory[];
  activePost: Post | null;
  activeStory: PostStory | null;
  shareModalPost: Post | null;
  activeCategory: string;
  searchQuery: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setActiveCategory: (cat: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  addComment: (postId: string, content: string, userName?: string) => void;
  incrementShareCount: (postId: string) => void;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  openShareModal: (post: Post) => void;
  closeShareModal: () => void;
  openStory: (story: PostStory) => void;
  closeStory: () => void;
  nextPost: () => void;
  prevPost: () => void;
  createPost: (post: Partial<Post>) => void;
  approvePost: (postId: string) => void;
  rejectPost: (postId: string) => void;
}

// Helper to get visitor liked post IDs from localStorage
function getLikedPostIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('shakh_visitor_liked_posts');
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {
    console.warn('Failed to parse liked posts', e);
  }
  return new Set();
}

function saveLikedPostIds(likedSet: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('shakh_visitor_liked_posts', JSON.stringify(Array.from(likedSet)));
  } catch (e) {
    console.warn('Failed to save liked posts', e);
  }
}

export const useSocialStore = create<SocialState>((set, get) => {
  const initialLiked = getLikedPostIds();
  const hydratedPosts = INITIAL_POSTS.map((p) => ({
    ...p,
    is_liked: initialLiked.has(p.id),
    likes_count: initialLiked.has(p.id) ? p.likes_count + 1 : p.likes_count,
  }));

  return {
    posts: hydratedPosts,
    stories: INITIAL_STORIES,
    activePost: null,
    activeStory: null,
    shareModalPost: null,
    activeCategory: 'all',
    searchQuery: '',

    setSearchQuery: (q) => set({ searchQuery: q }),
    setActiveCategory: (cat) => set({ activeCategory: cat }),

    toggleLikePost: (postId: string) => {
      const likedSet = getLikedPostIds();
      const isCurrentlyLiked = likedSet.has(postId);

      if (isCurrentlyLiked) {
        likedSet.delete(postId);
      } else {
        likedSet.add(postId);
      }
      saveLikedPostIds(likedSet);

      set((state) => {
        const updatedPosts = state.posts.map((p) => {
          if (p.id === postId) {
            const nextLiked = !isCurrentlyLiked;
            return {
              ...p,
              is_liked: nextLiked,
              likes_count: nextLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
            };
          }
          return p;
        });

        const currentActive = state.activePost;
        const updatedActive =
          currentActive && currentActive.id === postId
            ? updatedPosts.find((p) => p.id === postId) || null
            : currentActive;

        return {
          posts: updatedPosts,
          activePost: updatedActive,
        };
      });
    },

    toggleLikeComment: (postId: string, commentId: string) => {
      set((state) => {
        const updatedPosts = state.posts.map((p) => {
          if (p.id === postId) {
            const updatedComments = p.comments.map((c) => {
              if (c.id === commentId) {
                const nextLiked = !c.is_liked;
                return {
                  ...c,
                  is_liked: nextLiked,
                  likes_count: nextLiked ? c.likes_count + 1 : Math.max(0, c.likes_count - 1),
                };
              }
              return c;
            });
            return { ...p, comments: updatedComments };
          }
          return p;
        });

        const currentActive = state.activePost;
        const updatedActive =
          currentActive && currentActive.id === postId
            ? updatedPosts.find((p) => p.id === postId) || null
            : currentActive;

        return {
          posts: updatedPosts,
          activePost: updatedActive,
        };
      });
    },

    addComment: (postId: string, content: string, userName?: string) => {
      if (!content.trim()) return;

      const newComment: PostComment = {
        id: `c-${Date.now()}`,
        user_name: userName || 'سەردانیکەری پلاتفۆرمی شاخ',
        user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        content: content.trim(),
        created_at: new Date().toISOString(),
        likes_count: 0,
        is_liked: false,
      };

      set((state) => {
        const updatedPosts = state.posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments_count: p.comments_count + 1,
              comments: [newComment, ...p.comments],
            };
          }
          return p;
        });

        const currentActive = state.activePost;
        const updatedActive =
          currentActive && currentActive.id === postId
            ? updatedPosts.find((p) => p.id === postId) || null
            : currentActive;

        return {
          posts: updatedPosts,
          activePost: updatedActive,
        };
      });
    },

    incrementShareCount: (postId: string) => {
      set((state) => {
        const updatedPosts = state.posts.map((p) => {
          if (p.id === postId) {
            return { ...p, shares_count: p.shares_count + 1 };
          }
          return p;
        });
        const currentActive = state.activePost;
        const updatedActive =
          currentActive && currentActive.id === postId
            ? updatedPosts.find((p) => p.id === postId) || null
            : currentActive;

        return {
          posts: updatedPosts,
          activePost: updatedActive,
        };
      });
    },

    openPostDetail: (post: Post) => {
      // Increment views count smoothly
      set((state) => ({
        activePost: { ...post, views_count: post.views_count + 1 },
        posts: state.posts.map((p) => (p.id === post.id ? { ...p, views_count: p.views_count + 1 } : p)),
      }));
    },

    closePostDetail: () => set({ activePost: null }),

    openShareModal: (post: Post) => set({ shareModalPost: post }),
    closeShareModal: () => set({ shareModalPost: null }),

    openStory: (story: PostStory) => {
      set((state) => ({
        activeStory: story,
        stories: state.stories.map((s) => (s.id === story.id ? { ...s, has_unread: false } : s)),
      }));
    },
    closeStory: () => set({ activeStory: null }),

    nextPost: () => {
      const { posts, activePost } = get();
      if (!activePost) return;
      const idx = posts.findIndex((p) => p.id === activePost.id);
      if (idx !== -1 && idx < posts.length - 1) {
        set({ activePost: posts[idx + 1] });
      }
    },

    prevPost: () => {
      const { posts, activePost } = get();
      if (!activePost) return;
      const idx = posts.findIndex((p) => p.id === activePost.id);
      if (idx > 0) {
        set({ activePost: posts[idx - 1] });
      }
    },

    createPost: (partialPost: Partial<Post>) => {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        author: partialPost.author || {
          id: 'user-self',
          name: 'پلاتفۆرمی شاخ | نوێکردنەوە',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          verified: true,
          type: 'store',
        },
        title: partialPost.title || '',
        content: partialPost.content || '',
        content_ku: partialPost.content_ku || partialPost.content || '',
        content_ar: partialPost.content_ar || partialPost.content || '',
        content_en: partialPost.content_en || partialPost.content || '',
        images: partialPost.images && partialPost.images.length > 0
          ? partialPost.images
          : ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'],
        tags: partialPost.tags || ['#SHAKH'],
        category: partialPost.category || 'all',
        status: partialPost.category === 'cars' ? 'pending' : 'approved',
        likes_count: 1,
        comments_count: 0,
        shares_count: 0,
        views_count: 12,
        is_liked: true,
        created_at: new Date().toISOString(),
        product: partialPost.product,
        deal: partialPost.deal,
        fashion_details: partialPost.fashion_details,
        car_details: partialPost.car_details,
        tech_details: partialPost.tech_details,
        food_details: partialPost.food_details,
        supermarket_details: partialPost.supermarket_details,
        comments: [],
      };

      set((state) => ({
        posts: [newPost, ...state.posts],
      }));
    },

    approvePost: (postId: string) => {
      set((state) => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          // Trigger a global UI notification
          if (typeof window !== 'undefined') {
            import('../lib/notifications').then(({ dispatchNotification }) => {
              dispatchNotification({
                title: 'پۆستەکەت پەسەند کرا (Post Approved)',
                body: `پۆستی "${post.car_details?.make || ''} ${post.car_details?.model || ''}" بڵاوکرایەوە.`,
              });
            });
          }
        }
        return {
          posts: state.posts.map(p => p.id === postId ? { ...p, status: 'approved' } : p)
        };
      });
    },

    rejectPost: (postId: string) => {
      set((state) => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
           // Trigger a global UI notification
           if (typeof window !== 'undefined') {
            import('../lib/notifications').then(({ dispatchNotification }) => {
              dispatchNotification({
                title: 'پۆستەکەت ڕەتکرایەوە (Post Rejected)',
                body: `پۆستی "${post.car_details?.make || ''} ${post.car_details?.model || ''}" ڕەتکرایەوە بەهۆی کێشە لە وەسلی پارەدان.`,
              });
            });
          }
        }
        return {
          posts: state.posts.map(p => p.id === postId ? { ...p, status: 'rejected' } : p)
        };
      });
    }
  };
});
