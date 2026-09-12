# SHAKH Store — Production

ئەم وەشانە بۆ production ئامادە کراوە: React + Vite لە Vercel، و Supabase بۆ Auth / PostgreSQL / RLS / Storage / Realtime.

## 1. پاککردنەوە و بنیادنانەوەی Supabase

فایلی:

`supabase/migrations/00000_production_rebuild.sql`

بە تەواوی **destructive** ـە. هەموو public tables، policies، data و هەژمارەکانی `auth.users` پاک دەکات و schema ـی نوێ دروست دەکات. Storage ـیش پاک و bucket ـەکانی `avatars`, `businesses`, `products`, `posts`, `stories` دروست دەکات.

> تەنها لە project ـی دروستی SHAKH جێبەجێی بکە.

### Schema ـە سەرەکییەکان

- `profiles`, `user_roles`
- `businesses`, `categories`, `products`, `product_price_history`
- `delivery_addresses`
- `orders`, `order_items`
- `captain_locations`, `captain_settlements`
- `posts`, `post_comments`, `post_likes`, `post_comment_likes`
- `stories`, `story_views`
- `notifications`
- `wallets`, `wallet_transactions`

RLS بۆ customer / merchant / captain / support / admin / super-admin جێگیر کراوە، و `supabase_realtime` بۆ orders, notifications, posts, comments, captain locations و products چالاکە. پۆستە گشتییەکان تەنها دوای approval پیشان دەدرێن؛ Super Admin/Admin دەتوانن pending ببینن و approve/reject بکەن.

## 2. Auth

App تەنها Auth ـی ڕاستەقینەی Supabase بەکاردهێنێت؛ هیچ Google/demo session ـی ساختە نییە.

لە Supabase:

1. Authentication → Providers → Google چالاک بکە.
2. Google OAuth Client ID/Secret دابین بکە.
3. Redirect URL ـی Supabase و Vercel domain ـەکەت زیاد بکە.
4. Trigger ـی `handle_new_user` خۆکارانە profile و `CUSTOMER` role دروست دەکات.
5. بۆ admin/captain/merchant roles لە `user_roles` ـەوە بە شێوەی approval کار بکە.

## 3. Environment ـی Vercel

لە Vercel → Project → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`service_role` یان secret ـەکانی Supabase **هەرگیز** لە Vercel client-side env ـی `VITE_*` مەخە.

## 4. Vercel

ئەم repository ـە Vite ـە. Build command:

```bash
npm run build
```

`vercel.json` rewrite ـی SPA هەیە بۆ ئەوەی route ـەکانی React لە refresh ـدا 404 نەدەن.

## 5. Supabase Edge Function

`supabase/functions/notify-user/index.ts` بۆ notification ـی server-side ـە.

Deploy:

```bash
supabase functions deploy notify-user
supabase secrets set NOTIFY_FUNCTION_SECRET="CHANGE_ME"
```

Function ـەکە بە service role notification لە `notifications` زیاد دەکات؛ service role تەنها لە Edge Function ـدا بەکاربهێنە.

## 6. Storage

Bucket ـەکان:

- `avatars`
- `businesses`
- `products`
- `posts`
- `stories`

Public read بۆ media، upload بۆ authenticated users، و update/delete بۆ خاوەنی object دانراوە.

## 7. Production data flow

- Marketplace → `businesses` + `products`
- Cart → session state؛ هیچ product/order data لە localStorage نەپارێزرێت
- Addresses → `delivery_addresses`
- Orders → `orders` + `order_items`
- Tracking → Supabase Realtime
- Social → `posts` / comments / likes / stories
- Captain finance → `orders` + `captain_settlements`
- Notifications → `notifications` + Realtime
- Theme preference → `profiles.theme_preference`

هیچ sample order، fake captain، fake product، fake social post یان demo auth session لە app ـی production ماوە نییە. Role switcher تەنها ئەو role ـانە پیشان دەدات کە Supabase بۆ هەژمارەکە approve کردووە؛ URL بە تەنیا authorization نییە.

## 8. Before deploy — fix checklist

### ئەگەر داتای ئێستات دەتەوێت بمێنێت
پێش reset، `SUPABASE_PRODUCTION_PATCH.sql` لە Supabase SQL Editor جێبەجێ بکە. ئەمە **non-destructive** ـە و users/orders/posts/products ناداتەوە.

### ئەگەر project ـەکە تازەیە و هیچ داتای گرنگی تێدا نییە
`SUPABASE_PRODUCTION_RESET.sql` جێبەجێ بکە. ئەمە **destructive** ـە و هەموو auth users و public data پاک دەکات.

### Domain
Domain ـی production:
`https://daim-post.online`

لە Vercel:
1. Project → Settings → Domains → `daim-post.online` زیاد بکە.
2. DNS ـی domain بەپێی ئەو records ـەی Vercel پێت دەدات ڕێکبخە.
3. دڵنیابە `https://daim-post.online` بە HTTPS دەکرێتەوە.

لە Supabase → Authentication → URL Configuration:
- Site URL: `https://daim-post.online`
- Redirect URL: `https://daim-post.online/**`

لە Google Cloud OAuth:
- Authorized JavaScript origin: `https://daim-post.online`
- Authorized redirect URI: ئەو Supabase callback URL ـەی Supabase لە Google Provider ـدا پیشانی دەدات.

### Vercel Environment Variables
تەنها:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`service_role` و `NOTIFY_FUNCTION_SECRET` هەرگیز لە client-side/VITE env مەخە.

## 9. Deploy

```bash
npm ci
npm run lint
npm run build
```

پاشان repository ـەکە لە Vercel import بکە و environment variables ـەکان زیاد بکە.

## Important

فایلەکانی `initialPosts.ts` و `trackedProducts.ts` و migration ـە کۆنەکان لابراون. `src/data/locations.ts` تەنها static geographic reference ـە، نە mock business/order data.
