-- SHAKH PRODUCTION PATCH (NON-DESTRUCTIVE)
-- Run this AFTER the existing SHAKH schema is in place.
-- This patch does NOT delete users, products, orders, posts, storage or other data.

begin;

create or replace function public.has_role(p_user_id uuid, p_role text)
returns boolean
language sql stable security definer set search_path=public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id=p_user_id and role=p_role and status='approved'
  );
$$;

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$
  select public.has_role(p_user_id,'SUPER_ADMIN')
      or public.has_role(p_user_id,'ADMIN');
$$;

create or replace function public.can_publish_category(p_user_id uuid, p_category text)
returns boolean
language sql stable security definer set search_path=public
as $$
  select public.is_admin(p_user_id)
  or (p_category='food' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role in ('RESTAURANT','FOOD_MERCHANT')))
  or (p_category='market' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role in ('SUPERMARKET','MARKET_MERCHANT')))
  or (p_category='fashion' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role in ('FASHION','FASHION_MERCHANT')))
  or (p_category='cars' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role in ('CAR_SELLER','CARS_MERCHANT')))
  or (p_category='beauty' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role='BEAUTY'))
  or (p_category='tech' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role in ('TECH','TECH_MERCHANT')))
  or (p_category='umrah' and exists(select 1 from public.user_roles where user_id=p_user_id and status='approved' and role='UMRAH'));
$$;

create or replace function public.enforce_post_status()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if auth.uid() is not null and auth.uid()=new.author_id and not public.is_admin(auth.uid()) then
    if tg_op='INSERT' then
      new.status := 'pending';
    elsif new.status is distinct from old.status then
      new.status := old.status;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_enforce_status on public.posts;
create trigger posts_enforce_status
before insert or update on public.posts
for each row execute function public.enforce_post_status();

create or replace function public.get_public_profiles(p_user_ids uuid[])
returns table(id uuid, full_name text, avatar text)
language sql stable security definer set search_path=public
as $$
  select p.id,p.full_name,p.avatar
  from public.profiles p
  where p.id=any(p_user_ids);
$$;
grant execute on function public.get_public_profiles(uuid[]) to anon, authenticated;
grant execute on function public.can_publish_category(uuid,text) to authenticated;

drop policy if exists posts_owner_insert on public.posts;
create policy posts_owner_insert on public.posts for insert
with check (auth.uid()=author_id and public.can_publish_category(auth.uid(),category));

drop policy if exists posts_owner_update on public.posts;
create policy posts_owner_update on public.posts for update
using (auth.uid()=author_id or public.is_admin())
with check (
  (auth.uid()=author_id and public.can_publish_category(auth.uid(),category))
  or public.is_admin()
);

-- Cash-only customer orders.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='orders_cash_only'
      and conrelid='public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_cash_only
      check (payment_method='CASH_ON_DELIVERY');
  end if;
end $$;

-- Realtime: add only when the table is not already a member.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='post_comments') then
    alter publication supabase_realtime add table public.post_comments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='products') then
    alter publication supabase_realtime add table public.products;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='captain_locations') then
    alter publication supabase_realtime add table public.captain_locations;
  end if;
end $$;

commit;
