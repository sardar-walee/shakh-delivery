# SHAKH — Production Deployment Checklist

## 1. Supabase
- [ ] Confirm this is the correct SHAKH project.
- [ ] If existing data must remain, run `SUPABASE_PRODUCTION_PATCH.sql`.
- [ ] If this is a new/empty project, run `SUPABASE_PRODUCTION_RESET.sql`.
- [ ] Confirm Storage buckets: `avatars`, `businesses`, `products`, `posts`, `stories`.
- [ ] Confirm Realtime includes `posts`, `post_comments`, `products`, `orders`, `notifications`, `captain_locations`.
- [ ] Enable Google provider in Authentication.
- [ ] Set Site URL to `https://daim-post.online`.
- [ ] Add redirect URL `https://daim-post.online/**`.
- [ ] Never expose a service-role key in `VITE_*`.

## 2. Vercel
Environment variables:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Build:
```bash
npm ci
npm run lint
npm run build
```

## 3. Domain
- [ ] Add `daim-post.online` to Vercel.
- [ ] Apply the DNS records shown by Vercel.
- [ ] Confirm HTTPS works.
- [ ] Confirm `/`, `/marketplace`, `/orders`, `/dashboard`, `/profile`, `/login` all survive refresh.

## 4. Google OAuth
In Google Cloud OAuth credentials:
- [ ] Authorized JavaScript origin: `https://daim-post.online`
- [ ] Authorized redirect URI: the Supabase callback URL shown by the Google provider configuration.

## 5. Critical live tests
1. Create a normal customer account. A CUSTOMER cannot publish marketplace posts.
2. Approve a merchant role in `user_roles`.
3. Merchant creates a post. It must be `pending`.
4. Super Admin sees the pending post immediately and can approve/reject it.
5. After approval, a separate browser/incognito session sees the post.
6. Open a second browser tab and create/update a post: the feed refreshes through Supabase Realtime.
7. Upload a post image: the database must contain a Storage URL, never base64 data.
8. Create/update a product: Marketplace updates through Supabase/Realtime.
9. Create a cash order and verify customer/business/captain visibility according to RLS.
10. Verify no Firebase requests/configuration are present.
