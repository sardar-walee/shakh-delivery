-- =================================================================
-- SHAKH Super App: Production Canonical Schema Migration
-- Migration 00002: Schema Unification, Missing Tables & Security Hardening
-- Safe, Non-Destructive, Idempotent Execution
-- =================================================================

-- 1. Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Extend role_type enum safely without dropping existing types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE role_type AS ENUM (
      'SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'CAPTAIN', 'CUSTOMER',
      'RESTAURANT', 'SUPERMARKET', 'FASHION', 'UMRAH', 'CAR_SELLER', 'BEAUTY', 'TECH',
      'FOOD_MERCHANT', 'MARKET_MERCHANT', 'FASHION_MERCHANT', 'CARS_MERCHANT', 'TECH_MERCHANT'
    );
  ELSE
    -- Add any missing role values to existing enum
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'FOOD_MERCHANT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'MARKET_MERCHANT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'FASHION_MERCHANT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'CARS_MERCHANT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'TECH_MERCHANT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'TECH'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'SUPPORT'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- 3. Ensure core tables exist and add any missing columns safely
-- Profiles table additions
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Orders table additions
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'food',
  ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER DEFAULT 25,
  ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_date TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_slot_label TEXT;

-- Products table additions
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Create missing canonical tables

-- Delivery Addresses table
CREATE TABLE IF NOT EXISTS delivery_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    tag TEXT DEFAULT 'home',
    city TEXT NOT NULL,
    district TEXT,
    sub_district TEXT,
    street_address TEXT NOT NULL,
    building_name TEXT,
    floor_apartment TEXT,
    nearest_landmark TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone_contact TEXT,
    driver_instructions TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Captain Real-time Locations
CREATE TABLE IF NOT EXISTS captain_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    captain_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION DEFAULT 0,
    speed DOUBLE PRECISION DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Captain Cash Settlements
CREATE TABLE IF NOT EXISTS captain_settlements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    captain_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount_returned DECIMAL(12,2) NOT NULL,
    previous_balance DECIMAL(12,2) DEFAULT 0,
    new_balance DECIMAL(12,2) DEFAULT 0,
    breakdown JSONB DEFAULT '{}'::jsonb,
    payment_method TEXT NOT NULL,
    received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reference_code TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social & Merchant Feed Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    title TEXT,
    content TEXT NOT NULL,
    content_ku TEXT,
    content_ar TEXT,
    content_en TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'all',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    location_name TEXT,
    status TEXT DEFAULT 'approved',
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    deal JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_post_like'
  ) THEN
    ALTER TABLE likes ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id);
  END IF;
END $$;

-- Stories
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    title TEXT,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    pending_balance DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL, -- CREDIT, DEBIT
    reference_type TEXT, -- ORDER, SETTLEMENT, REFUND, TOPUP
    reference_id TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Safe Data Migration from legacy restaurants table if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'restaurants') THEN
    INSERT INTO businesses (
      id, owner_id, type, name, description, logo, cover_image, 
      status, is_open, latitude, longitude, address, commission_rate, 
      created_at, updated_at
    )
    SELECT 
      r.id,
      COALESCE(r.owner_id, (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)),
      'RESTAURANT',
      r.name,
      r.description,
      r.logo,
      r.cover_image,
      COALESCE(r.status, 'active'),
      COALESCE(r.is_open, true),
      r.latitude,
      r.longitude,
      r.address,
      COALESCE(r.commission_rate, 10.0),
      COALESCE(r.created_at, NOW()),
      COALESCE(r.updated_at, NOW())
    FROM restaurants r
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 6. Trigger for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_delivery_addresses_updated_at') THEN
    CREATE TRIGGER tr_delivery_addresses_updated_at BEFORE UPDATE ON delivery_addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_posts_updated_at') THEN
    CREATE TRIGGER tr_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_wallets_updated_at') THEN
    CREATE TRIGGER tr_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 7. Enable Row-Level Security (RLS) on all tables
ALTER TABLE delivery_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Row-Level Security Policies

-- Delivery Addresses: Users have full access to their own addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON delivery_addresses;
CREATE POLICY "Users can view own addresses" ON delivery_addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON delivery_addresses;
CREATE POLICY "Users can insert own addresses" ON delivery_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON delivery_addresses;
CREATE POLICY "Users can update own addresses" ON delivery_addresses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON delivery_addresses;
CREATE POLICY "Users can delete own addresses" ON delivery_addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Captain Locations: Anyone can read online captain locations, captains manage own
DROP POLICY IF EXISTS "Anyone can view online captain locations" ON captain_locations;
CREATE POLICY "Anyone can view online captain locations" ON captain_locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Captains can upsert own location" ON captain_locations;
CREATE POLICY "Captains can upsert own location" ON captain_locations
  FOR ALL USING (auth.uid() = captain_id);

-- Captain Settlements: Captains view own, admins manage
DROP POLICY IF EXISTS "Captains can view own settlements" ON captain_settlements;
CREATE POLICY "Captains can view own settlements" ON captain_settlements
  FOR SELECT USING (
    auth.uid() = captain_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

DROP POLICY IF EXISTS "Admins can insert settlements" ON captain_settlements;
CREATE POLICY "Admins can insert settlements" ON captain_settlements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

-- Posts: Public read approved, authors and admins manage
DROP POLICY IF EXISTS "Anyone can view approved posts" ON posts;
CREATE POLICY "Anyone can view approved posts" ON posts
  FOR SELECT USING (
    status = 'approved' OR 
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and admins can update posts" ON posts;
CREATE POLICY "Authors and admins can update posts" ON posts
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

DROP POLICY IF EXISTS "Authors and admins can delete posts" ON posts;
CREATE POLICY "Authors and admins can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

-- Comments: Public read, authenticated write
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post comments" ON comments;
CREATE POLICY "Authenticated users can post comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update comments" ON comments;
CREATE POLICY "Authors can update comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON comments;
CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

-- Likes: Public read, authenticated write own
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- Stories: View unexpired, authors manage
DROP POLICY IF EXISTS "Anyone can view active stories" ON stories;
CREATE POLICY "Anyone can view active stories" ON stories
  FOR SELECT USING (expires_at > NOW() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert stories" ON stories;
CREATE POLICY "Users can insert stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can only access own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Wallets: Users view own wallet, admins view all
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'approved')
  );

-- 9. Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('businesses', 'businesses', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('posts', 'posts', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']),
  ('stories', 'stories', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Object Policies
DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
CREATE POLICY "Public read storage" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'businesses', 'products', 'posts', 'stories'));

DROP POLICY IF EXISTS "Authenticated upload storage" ON storage.objects;
CREATE POLICY "Authenticated upload storage" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id IN ('avatars', 'businesses', 'products', 'posts', 'stories')
  );

DROP POLICY IF EXISTS "Owner update storage" ON storage.objects;
CREATE POLICY "Owner update storage" ON storage.objects
  FOR UPDATE USING (
    auth.uid() = owner AND 
    bucket_id IN ('avatars', 'businesses', 'products', 'posts', 'stories')
  );

DROP POLICY IF EXISTS "Owner delete storage" ON storage.objects;
CREATE POLICY "Owner delete storage" ON storage.objects
  FOR DELETE USING (
    auth.uid() = owner AND 
    bucket_id IN ('avatars', 'businesses', 'products', 'posts', 'stories')
  );
