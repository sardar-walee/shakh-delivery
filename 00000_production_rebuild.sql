-- SHAKH production rebuild
-- WARNING: DESTRUCTIVE. Run only against the SHAKH Supabase project you intend to rebuild.
-- This removes the public schema data and auth users, then creates a clean production schema.

begin;

-- 1) COMPLETE RESET ----------------------------------------------------------
drop schema if exists public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 2) ENUMS -------------------------------------------------------------------
create type public.order_status as enum (
  'NEW','ACCEPTED','PREPARING','READY','CAPTAIN_ASSIGNED',
  'PICKED_UP','ON_THE_WAY','DELIVERED','CANCELLED'
);
create type public.payment_status as enum (
  'PENDING','AUTHORIZED','PAID','FAILED','REFUNDED','CANCELLED'
);
create type public.business_type as enum (
  'RESTAURANT','SUPERMARKET','FASHION','UMRAH','CAR','BEAUTY','TECH'
);

-- 3) COMMON HELPERS ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin new.updated_at = now(); return new; end $$;

-- 4) PROFILES / RBAC ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text unique,
  email text unique,
  avatar text,
  language text not null default 'ku' check (language in ('ku','ar','en')),
  theme_preference text check (theme_preference in ('light','dark','system')),
  status text not null default 'active' check (status in ('active','suspended','pending')),
  fcm_token text,
  push_notifications_enabled boolean not null default false,
  notifications_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in (
    'SUPER_ADMIN','ADMIN','SUPPORT','CAPTAIN','CUSTOMER',
    'RESTAURANT','SUPERMARKET','FASHION','UMRAH','CAR_SELLER','BEAUTY','TECH',
    'FOOD_MERCHANT','MARKET_MERCHANT','FASHION_MERCHANT','CARS_MERCHANT','TECH_MERCHANT'
  )),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, role)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id,full_name,email,avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    lower(new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
    avatar = coalesce(public.profiles.avatar, excluded.avatar),
    updated_at = now();

  insert into public.user_roles(user_id,role,status)
  values (new.id,'CUSTOMER','approved')
  on conflict (user_id,role) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.has_role(p_user_id uuid, p_role text)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.user_roles
  where user_id = p_user_id and role = p_role and status = 'approved'
); $$;

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(p_user_id,'SUPER_ADMIN')
        or public.has_role(p_user_id,'ADMIN'); $$;


create or replace function public.can_publish_category(p_user_id uuid, p_category text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin(p_user_id)
  or (
    p_category = 'food' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role in ('RESTAURANT','FOOD_MERCHANT')
    )
  )
  or (
    p_category = 'market' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role in ('SUPERMARKET','MARKET_MERCHANT')
    )
  )
  or (
    p_category = 'fashion' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role in ('FASHION','FASHION_MERCHANT')
    )
  )
  or (
    p_category = 'cars' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role in ('CAR_SELLER','CARS_MERCHANT')
    )
  )
  or (
    p_category = 'beauty' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role = 'BEAUTY'
    )
  )
  or (
    p_category = 'tech' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role in ('TECH','TECH_MERCHANT')
    )
  )
  or (
    p_category = 'umrah' and exists (
      select 1 from public.user_roles where user_id=p_user_id and status='approved'
      and role = 'UMRAH'
    )
  );
$$;

create or replace function public.enforce_post_status()
returns trigger
language plpgsql security definer set search_path=public
as $$
begin
  if auth.uid() is not null and auth.uid() = new.author_id and not public.is_admin(auth.uid()) then
    if tg_op = 'INSERT' then
      new.status := 'pending';
    elsif new.status is distinct from old.status then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.get_public_profiles(p_user_ids uuid[])
returns table(id uuid, full_name text, avatar text)
language sql stable security definer set search_path=public
as $$
  select p.id, p.full_name, p.avatar
  from public.profiles p
  where p.id = any(p_user_ids);
$$;

grant execute on function public.get_public_profiles(uuid[]) to anon, authenticated;
grant execute on function public.can_publish_category(uuid,text) to authenticated;


-- 5) MARKETPLACE -------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  type public.business_type not null,
  name text not null,
  description text,
  logo text,
  cover_image text,
  status text not null default 'active' check (status in ('active','inactive','pending','suspended')),
  is_open boolean not null default true,
  latitude double precision,
  longitude double precision,
  address text,
  phone text,
  commission_rate numeric(5,2) not null default 10 check (commission_rate between 0 and 100),
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  name_ku text,
  name_ar text,
  name_en text,
  image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  is_available boolean not null default true,
  rating numeric(3,2) not null default 0 check (rating between 0 and 5),
  reviews_count int not null default 0 check (reviews_count >= 0),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  note text,
  event text check (event in ('discount','price_drop','normal','price_hike','lowest')),
  recorded_at timestamptz not null default now()
);

-- 6) ADDRESSES ---------------------------------------------------------------
create table public.delivery_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  tag text not null default 'home',
  city text not null,
  district text,
  street_address text not null,
  building_name text,
  floor_apartment text,
  nearest_landmark text,
  latitude double precision not null,
  longitude double precision not null,
  phone_contact text,
  driver_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_default_address_per_user
on public.delivery_addresses(user_id) where is_default;

-- 7) ORDERS / DELIVERY -------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  business_id uuid not null references public.businesses(id) on delete restrict,
  captain_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'NEW',
  payment_status public.payment_status not null default 'PENDING',
  payment_method text not null default 'CASH_ON_DELIVERY' check (payment_method='CASH_ON_DELIVERY'),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  platform_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  commission numeric(12,2) not null default 0,
  address jsonb not null default '{}',
  latitude double precision,
  longitude double precision,
  notes text,
  estimated_delivery_minutes int,
  is_scheduled boolean not null default false,
  scheduled_at timestamptz,
  scheduled_slot_label text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null check (total >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.captain_locations (
  captain_id uuid primary key references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  heading double precision,
  accuracy double precision,
  updated_at timestamptz not null default now()
);

create table public.captain_settlements (
  id uuid primary key default gen_random_uuid(),
  captain_id uuid not null references public.profiles(id) on delete restrict,
  amount_returned numeric(12,2) not null check (amount_returned > 0),
  previous_balance numeric(12,2) not null default 0,
  new_balance numeric(12,2) not null default 0,
  payment_method text not null,
  breakdown jsonb not null default '{}',
  received_by uuid references public.profiles(id),
  reference_code text not null unique default upper('RC-' || substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  notes text,
  created_at timestamptz not null default now()
);

-- 8) SOCIAL ------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  content_ku text,
  content_ar text,
  content_en text,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  category text not null default 'all',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  likes_count int not null default 0,
  comments_count int not null default 0,
  shares_count int not null default 0,
  views_count int not null default 0,
  location_name text,
  product jsonb,
  deal jsonb,
  fashion_details jsonb,
  car_details jsonb,
  tech_details jsonb,
  food_details jsonb,
  supermarket_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  likes_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);

create table public.post_comment_likes (
  comment_id uuid not null references public.post_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(comment_id,user_id)
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  title text,
  status text not null default 'active' check (status in ('active','expired','removed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key(story_id,user_id)
);

-- 9) NOTIFICATIONS / FINANCE -------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'general',
  is_read boolean not null default false,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  balance numeric(14,2) not null default 0,
  pending_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null,
  amount numeric(14,2) not null,
  reference_id uuid,
  description text,
  created_at timestamptz not null default now()
);

-- 10) INDEXES ----------------------------------------------------------------
create index idx_businesses_owner on public.businesses(owner_id);
create index idx_businesses_type_status on public.businesses(type,status);
create index idx_products_business on public.products(business_id);
create index idx_products_category on public.products(category_id);
create index idx_orders_customer on public.orders(customer_id,created_at desc);
create index idx_orders_business on public.orders(business_id,created_at desc);
create index idx_orders_captain on public.orders(captain_id,created_at desc);
create index idx_orders_status on public.orders(status,created_at desc);
create index idx_notifications_user on public.notifications(user_id,created_at desc);
create index idx_posts_status_created on public.posts(status,created_at desc);
create index idx_post_comments_post on public.post_comments(post_id,created_at desc);
create index idx_price_history_product on public.product_price_history(product_id,recorded_at desc);

-- 11) TRIGGERS ---------------------------------------------------------------
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger user_roles_updated_at before update on public.user_roles for each row execute function public.set_updated_at();
create trigger businesses_updated_at before update on public.businesses for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger posts_enforce_status before insert or update on public.posts for each row execute function public.enforce_post_status();
create trigger post_comments_updated_at before update on public.post_comments for each row execute function public.set_updated_at();
create trigger wallets_updated_at before update on public.wallets for each row execute function public.set_updated_at();

create or replace function public.sync_post_counters()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if tg_table_name = 'post_likes' then
    update posts set likes_count = (select count(*) from post_likes where post_id = coalesce(new.post_id,old.post_id))
    where id = coalesce(new.post_id,old.post_id);
  elsif tg_table_name = 'post_comments' then
    update posts set comments_count = (select count(*) from post_comments where post_id = coalesce(new.post_id,old.post_id))
    where id = coalesce(new.post_id,old.post_id);
  end if;
  return coalesce(new,old);
end $$;

create trigger post_likes_counter after insert or delete on public.post_likes for each row execute function public.sync_post_counters();
create trigger post_comments_counter after insert or delete on public.post_comments for each row execute function public.sync_post_counters();

create or replace function public.increment_post_shares(p_post_id uuid)
returns void language sql security definer set search_path=public
as $$ update public.posts set shares_count=shares_count+1 where id=p_post_id; $$;

create or replace function public.increment_post_views(p_post_id uuid)
returns void language sql security definer set search_path=public
as $$ update public.posts set views_count=views_count+1 where id=p_post_id; $$;


create or replace function public.notify_order_status_change()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if tg_op='INSERT' or new.status is distinct from old.status then
    insert into public.notifications(user_id,title,body,type,data)
    values (new.customer_id, 'Order update', 'Your order ' || new.order_number || ' is now ' || replace(new.status::text,'_',' '), 'order_status', jsonb_build_object('order_id',new.id,'status',new.status));
    if new.captain_id is not null then
      insert into public.notifications(user_id,title,body,type,data)
      values (new.captain_id, 'Delivery update', 'Order ' || new.order_number || ' is now ' || replace(new.status::text,'_',' '), 'order_status', jsonb_build_object('order_id',new.id,'status',new.status));
    end if;
  end if;
  return new;
end $$;
create trigger order_status_notifications after insert or update of status,captain_id on public.orders for each row execute function public.notify_order_status_change();

-- 12) RLS --------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_price_history enable row level security;
alter table public.delivery_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.captain_locations enable row level security;
alter table public.captain_settlements enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comment_likes enable row level security;
alter table public.stories enable row level security;
alter table public.story_views enable row level security;
alter table public.notifications enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

-- Profiles
create policy profiles_select_self_or_admin on public.profiles for select using (auth.uid()=id or public.is_admin());
create policy profiles_update_self_or_admin on public.profiles for update using (auth.uid()=id or public.is_admin());
create policy profiles_insert_self on public.profiles for insert with check (auth.uid()=id);

-- Roles
create policy roles_select_self_or_admin on public.user_roles for select using (auth.uid()=user_id or public.is_admin());
create policy roles_admin_manage on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- Marketplace
create policy businesses_public_read on public.businesses for select using (status='active');
create policy businesses_owner_manage on public.businesses for all using (auth.uid()=owner_id or public.is_admin()) with check (auth.uid()=owner_id or public.is_admin());

create policy categories_public_read on public.categories for select using (
  exists(select 1 from businesses b where b.id=business_id and b.status='active')
);
create policy categories_owner_manage on public.categories for all using (
  exists(select 1 from businesses b where b.id=business_id and (b.owner_id=auth.uid() or public.is_admin()))
) with check (
  exists(select 1 from businesses b where b.id=business_id and (b.owner_id=auth.uid() or public.is_admin()))
);

create policy products_public_read on public.products for select using (
  is_available=true and exists(select 1 from businesses b where b.id=business_id and b.status='active')
);
create policy products_owner_manage on public.products for all using (
  exists(select 1 from businesses b where b.id=business_id and (b.owner_id=auth.uid() or public.is_admin()))
) with check (
  exists(select 1 from businesses b where b.id=business_id and (b.owner_id=auth.uid() or public.is_admin()))
);

create policy price_history_public_read on public.product_price_history for select using (
  exists(select 1 from products p join businesses b on b.id=p.business_id where p.id=product_id and b.status='active')
);
create policy price_history_owner_manage on public.product_price_history for all using (
  exists(select 1 from products p join businesses b on b.id=p.business_id where p.id=product_id and (b.owner_id=auth.uid() or public.is_admin()))
);

-- Addresses
create policy addresses_owner_all on public.delivery_addresses for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Orders
create policy orders_read_customer on public.orders for select using (auth.uid()=customer_id);
create policy orders_read_business on public.orders for select using (exists(select 1 from businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy orders_read_captain on public.orders for select using (auth.uid()=captain_id);
create policy orders_admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy orders_customer_insert on public.orders for insert with check (auth.uid()=customer_id);
create policy orders_customer_update_cancel on public.orders for update using (auth.uid()=customer_id) with check (auth.uid()=customer_id);

create policy order_items_read_participant on public.order_items for select using (
  exists(select 1 from orders o where o.id=order_id and (
    o.customer_id=auth.uid() or o.captain_id=auth.uid() or
    exists(select 1 from businesses b where b.id=o.business_id and b.owner_id=auth.uid()) or public.is_admin()
  ))
);
create policy order_items_customer_insert on public.order_items for insert with check (
  exists(select 1 from orders o where o.id=order_id and o.customer_id=auth.uid())
);
create policy order_items_admin_manage on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- Captain
create policy captain_locations_read_participants on public.captain_locations for select using (
  auth.uid()=captain_id or public.is_admin() or exists(select 1 from orders o where o.captain_id=captain_id and o.customer_id=auth.uid())
);
create policy captain_locations_write_self on public.captain_locations for all using (auth.uid()=captain_id) with check (auth.uid()=captain_id);

create policy captain_settlements_read_self_or_admin on public.captain_settlements for select using (auth.uid()=captain_id or public.is_admin());
create policy captain_settlements_admin_manage on public.captain_settlements for all using (public.is_admin()) with check (public.is_admin());

-- Social
create policy posts_public_read_approved on public.posts for select using (status='approved');
create policy posts_owner_read on public.posts for select using (auth.uid()=author_id or public.is_admin());
create policy posts_owner_insert on public.posts for insert with check (
  auth.uid()=author_id and public.can_publish_category(auth.uid(), category)
);
create policy posts_owner_update on public.posts for update
  using (auth.uid()=author_id or public.is_admin())
  with check (
    (auth.uid()=author_id and public.can_publish_category(auth.uid(), category))
    or public.is_admin()
  );
create policy posts_admin_manage on public.posts for delete using (public.is_admin());

create policy comments_public_read on public.post_comments for select using (exists(select 1 from posts p where p.id=post_id and p.status='approved'));
create policy comments_auth_insert on public.post_comments for insert with check (auth.uid()=author_id);
create policy comments_owner_delete on public.post_comments for delete using (auth.uid()=author_id or public.is_admin());

create policy post_likes_read on public.post_likes for select using (auth.uid()=user_id or exists(select 1 from posts p where p.id=post_id and p.status='approved'));
create policy post_likes_manage_self on public.post_likes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy comment_likes_read on public.post_comment_likes for select using (auth.uid()=user_id);
create policy comment_likes_manage_self on public.post_comment_likes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

create policy stories_public_read on public.stories for select using (status='active' and expires_at>now());
create policy stories_owner_manage on public.stories for all using (auth.uid()=author_id or public.is_admin()) with check (auth.uid()=author_id or public.is_admin());
create policy story_views_self on public.story_views for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Notifications / wallet
create policy notifications_self on public.notifications for select using (auth.uid()=user_id);
create policy notifications_update_self on public.notifications for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy notifications_admin_insert on public.notifications for insert with check (public.is_admin() or auth.uid()=user_id);

create policy wallets_self on public.wallets for select using (auth.uid()=user_id or public.is_admin());
create policy wallet_transactions_self on public.wallet_transactions for select using (
  exists(select 1 from wallets w where w.id=wallet_id and (w.user_id=auth.uid() or public.is_admin()))
);

-- 13) GRANTS -----------------------------------------------------------------
grant select on public.businesses,public.categories,public.products,public.product_price_history,public.posts,public.post_comments,public.post_likes,public.stories to anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on function public.increment_post_shares(uuid),public.increment_post_views(uuid),public.has_role(uuid,text),public.is_admin(uuid) to anon,authenticated;

-- 14) REALTIME ---------------------------------------------------------------
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.captain_locations;
alter publication supabase_realtime add table public.products;

commit;

-- 15) STORAGE ---------------------------------------------------------------
drop policy if exists "public read shakh media" on storage.objects;
drop policy if exists "authenticated upload shakh media" on storage.objects;
drop policy if exists "owner update shakh media" on storage.objects;
drop policy if exists "owner delete shakh media" on storage.objects;
delete from storage.objects;
delete from storage.buckets;
-- Storage objects/buckets are outside public schema, so create them after the reset.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
  ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('businesses','businesses',true,10485760,array['image/jpeg','image/png','image/webp']),
  ('products','products',true,10485760,array['image/jpeg','image/png','image/webp']),
  ('posts','posts',true,20971520,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']),
  ('stories','stories',true,20971520,array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "public read shakh media" on storage.objects for select using (bucket_id in ('avatars','businesses','products','posts','stories'));
create policy "authenticated upload shakh media" on storage.objects for insert to authenticated with check (
  bucket_id in ('avatars','businesses','products','posts','stories') and auth.uid() is not null
);
create policy "owner update shakh media" on storage.objects for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "owner delete shakh media" on storage.objects for delete to authenticated using (owner_id=auth.uid());

-- Optional full auth wipe. The public reset above cascades from auth users, but this explicitly
-- removes existing accounts so the rebuilt project starts with zero users.
delete from auth.users;
