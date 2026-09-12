import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Post, PostStory, PostComment } from '../types/post';

interface SocialState {
  posts: Post[];
  stories: PostStory[];
  activePost: Post | null;
  activeStory: PostStory | null;
  shareModalPost: Post | null;
  activeCategory: string;
  searchQuery: string;
  loading: boolean;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (cat: string) => void;
  loadFeed: () => Promise<void>;
  subscribeToRealtime: () => () => void;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleLikeComment: (postId: string, commentId: string) => Promise<void>;
  addComment: (postId: string, content: string, userName?: string) => Promise<void>;
  incrementShareCount: (postId: string) => Promise<void>;
  openPostDetail: (post: Post) => void;
  closePostDetail: () => void;
  openShareModal: (post: Post) => void;
  closeShareModal: () => void;
  openStory: (story: PostStory) => void;
  closeStory: () => void;
  nextPost: () => void;
  prevPost: () => void;
  createPost: (post: Partial<Post>) => Promise<void>;
  approvePost: (postId: string) => Promise<void>;
  rejectPost: (postId: string) => Promise<void>;
}

const mapPost = (p: any): Post => ({
  id: p.id,
  author: {
    id: p.author?.id || p.author_id,
    name: p.author?.full_name || 'SHAKH',
    avatar: p.author?.avatar || '',
    verified: Boolean(p.author?.verified),
    type: p.author?.type || 'user',
    phone: p.author?.phone || undefined,
  },
  title: p.title || undefined,
  content: p.content || '',
  content_ku: p.content_ku || undefined,
  content_ar: p.content_ar || undefined,
  content_en: p.content_en || undefined,
  images: Array.isArray(p.images) ? p.images : [],
  tags: Array.isArray(p.tags) ? p.tags : [],
  category: p.category || 'all',
  likes_count: Number(p.likes_count || 0),
  comments_count: Number(p.comments_count || 0),
  shares_count: Number(p.shares_count || 0),
  views_count: Number(p.views_count || 0),
  is_liked: Boolean(p.is_liked),
  created_at: p.created_at,
  location_name: p.location_name || undefined,
  status: p.status,
  product: p.product || undefined,
  deal: p.deal || undefined,
  fashion_details: p.fashion_details || undefined,
  car_details: p.car_details || undefined,
  tech_details: p.tech_details || undefined,
  food_details: p.food_details || undefined,
  supermarket_details: p.supermarket_details || undefined,
  comments: (p.comments || []).map((c: any): PostComment => ({
    id: c.id,
    user_name: c.author?.full_name || 'User',
    user_avatar: c.author?.avatar || undefined,
    content: c.content,
    created_at: c.created_at,
    likes_count: Number(c.likes_count || 0),
    is_liked: Boolean(c.is_liked),
  })),
});

export const useSocialStore = create<SocialState>((set, get) => ({
  posts: [],
  stories: [],
  activePost: null,
  activeStory: null,
  shareModalPost: null,
  activeCategory: 'all',
  searchQuery: '',
  loading: false,

  setSearchQuery: (q) => set({ searchQuery: q }),
  subscribeToRealtime: () => {
    const channel = supabase
      .channel('shakh-social-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        void get().loadFeed();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
        void get().loadFeed();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        void get().loadFeed();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  loadFeed: async () => {
    set({ loading: true });
    const [{ data: posts, error }, { data: stories }] = await Promise.all([
      // RLS decides visibility: public users receive approved posts; admins/authors
      // can also receive their own pending posts for moderation. Do not hard-code
      // an approved-only filter here or the Super Admin moderation queue will be empty.
      supabase.from('posts').select('*, comments:post_comments(*)')
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('stories').select('*')
        .eq('status', 'active').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
    ]);

    if (error) {
      console.error('Failed to load SHAKH social feed:', error.message);
      set({ loading: false });
      return;
    }

    // Public profile data is fetched through a narrowly scoped RPC so the
    // profiles table can keep phone and private notification fields protected by RLS.
    const authorIds = Array.from(new Set(
      (posts || []).flatMap((p: any) => [
        p.author_id,
        ...((p.comments || []).map((c: any) => c.author_id)),
      ]).filter(Boolean)
    ));
    let profileMap = new Map<string, any>();
    if (authorIds.length) {
      const { data: publicProfiles, error: profileError } = await supabase
        .rpc('get_public_profiles', { p_user_ids: authorIds });
      if (!profileError) {
        profileMap = new Map((publicProfiles || []).map((p: any) => [p.id, p]));
      } else {
        console.warn('Could not load public post profiles:', profileError.message);
      }
    }

    const mappedPosts = (posts || []).map((p: any) => ({
      ...p,
      author: profileMap.get(p.author_id),
      comments: (p.comments || []).map((c: any) => ({
        ...c,
        author: profileMap.get(c.author_id),
      })),
    }));

    set({
      posts: mappedPosts.map(mapPost),
      stories: (stories || []).map((story: any) => {
        const author = profileMap.get(story.author_id);
        return {
          id: story.id, author_id: story.author_id, author_name: author?.full_name || 'SHAKH',
          author_avatar: author?.avatar || '', media_url: story.media_url || '',
          title: story.title || '', has_unread: true, expires_at: story.expires_at,
        };
      }),
      loading: false,
    });
  },

  toggleLikePost: async (postId) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.is_liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }
    await get().loadFeed();
  },

  toggleLikeComment: async (postId, commentId) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const post = get().posts.find((p) => p.id === postId);
    const comment = post?.comments.find((c) => c.id === commentId);
    if (!comment) return;
    if (comment.is_liked) await supabase.from('post_comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
    else await supabase.from('post_comment_likes').insert({ comment_id: commentId, user_id: user.id });
    await get().loadFeed();
  },

  addComment: async (postId, content) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !content.trim()) return;
    await supabase.from('post_comments').insert({ post_id: postId, author_id: user.id, content: content.trim() });
    await get().loadFeed();
  },

  incrementShareCount: async (postId) => {
    await supabase.rpc('increment_post_shares', { p_post_id: postId });
    await get().loadFeed();
  },

  openPostDetail: (post) => {
    set((state) => ({
      activePost: { ...post, views_count: post.views_count + 1 },
      posts: state.posts.map((p) => p.id === post.id ? { ...p, views_count: p.views_count + 1 } : p),
    }));
    void supabase.rpc('increment_post_views', { p_post_id: post.id });
  },
  closePostDetail: () => set({ activePost: null }),
  openShareModal: (post) => set({ shareModalPost: post }),
  closeShareModal: () => set({ shareModalPost: null }),
  openStory: (story) => set({ activeStory: story }),
  closeStory: () => set({ activeStory: null }),

  nextPost: () => {
    const { posts, activePost } = get(); if (!activePost) return;
    const i = posts.findIndex((p) => p.id === activePost.id);
    if (i >= 0 && i < posts.length - 1) set({ activePost: posts[i + 1] });
  },
  prevPost: () => {
    const { posts, activePost } = get(); if (!activePost) return;
    const i = posts.findIndex((p) => p.id === activePost.id);
    if (i > 0) set({ activePost: posts[i - 1] });
  },

  createPost: async (partial) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      title: partial.title || null,
      content: partial.content || '',
      content_ku: partial.content_ku || partial.content || null,
      content_ar: partial.content_ar || partial.content || null,
      content_en: partial.content_en || partial.content || null,
      images: partial.images || [],
      tags: partial.tags || [],
      category: partial.category || 'all',
      status: 'pending',
      product: partial.product || null,
      deal: partial.deal || null,
      fashion_details: partial.fashion_details || null,
      car_details: partial.car_details || null,
      tech_details: partial.tech_details || null,
      food_details: partial.food_details || null,
      supermarket_details: partial.supermarket_details || null,
      location_name: partial.location_name || null,
    });
    if (error) throw error;
    await get().loadFeed();
  },

  approvePost: async (postId) => {
    const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', postId);
    if (error) throw error;
    await get().loadFeed();
  },
  rejectPost: async (postId) => {
    const { error } = await supabase.from('posts').update({ status: 'rejected' }).eq('id', postId);
    if (error) throw error;
    await get().loadFeed();
  },
}));
