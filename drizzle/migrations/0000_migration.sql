-- Catalogue -----------------------------------------------------------------
create table public.categories (
  slug text primary key,
  name text not null,
  sort_order int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Categories are public" on public.categories for select to anon, authenticated using (true);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  image_url text not null,
  sort_order int not null default 0,
  is_sample boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.collections to anon, authenticated;
grant all on public.collections to service_role;
alter table public.collections enable row level security;
create policy "Published collections are public" on public.collections for select to anon, authenticated using (is_published);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  details text[] not null default '{}',
  care text[] not null default '{}',
  category_slug text not null references public.categories(slug),
  collection_id uuid references public.collections(id) on delete set null,
  price_pence int not null check (price_pence >= 0),
  sale_price_pence int check (sale_price_pence is null or sale_price_pence >= 0),
  currency text not null default 'GBP',
  images text[] not null default '{}',
  colours jsonb not null default '[]'::jsonb,
  sizes text[] not null default '{}',
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_sample boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_slug);
create index products_collection_idx on public.products(collection_id);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Published products are public" on public.products for select to anon, authenticated using (is_published);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  colour text not null,
  sku text not null unique,
  stock int not null default 0 check (stock >= 0),
  unique (product_id, size, colour)
);
grant select on public.product_variants to anon, authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "Variants are public" on public.product_variants for select to anon, authenticated using (true);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- Orders --------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SAF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid,
  email text not null,
  full_name text not null,
  phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postcode text not null,
  country text not null,
  shipping_method text not null,
  subtotal_pence int not null,
  shipping_pence int not null,
  total_pence int not null,
  currency text not null default 'GBP',
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','fulfilled','cancelled','refunded')),
  payment_provider text,
  payment_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id);
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Customers read their own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  colour text,
  size text,
  unit_price_pence int not null,
  quantity int not null check (quantity > 0),
  line_total_pence int not null
);
create index order_items_order_idx on public.order_items(order_id);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "Customers read their own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Newsletter & contact ------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 3 and 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated
  with check (char_length(email) between 3 and 320);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated
  with check (char_length(message) between 1 and 5000);

-- Sample catalogue (replace with Summer's real pieces) -----------------------
insert into public.categories (slug, name, sort_order) values
  ('swimwear', 'Swimwear', 1),
  ('dresses', 'Dresses', 2),
  ('cover-ups', 'Cover-Ups', 3),
  ('linen', 'Coastal Linen', 4),
  ('accessories', 'Accessories', 5);

insert into public.collections (slug, name, tagline, description, image_url, sort_order) values
  ('the-shoreline-edit', 'The Shoreline Edit', 'Swim for sunlit mornings', 'Sculpted swim silhouettes in ocean blues and sun-warmed neutrals, made for long days between sea and shore.', '/images/collection-shoreline.jpg', 1),
  ('golden-hour', 'Golden Hour', 'Evenings by the sea', 'Fluid silhouettes and champagne tones that carry you from the last swim of the day to dinner on the terrace.', '/images/collection-golden-hour.jpg', 2),
  ('riviera-linen', 'Riviera Linen', 'Effortless coastal ease', 'Breathable linens and relaxed tailoring in sand, ivory and salt-white for slow coastal living.', '/images/collection-riviera.jpg', 3);

insert into public.products (slug, name, description, details, care, category_slug, collection_id, price_pence, sale_price_pence, images, colours, sizes, is_bestseller, is_new, created_at) values
  ('shoreline-one-piece', 'Shoreline One-Piece', 'A scoop-neck one-piece with a softly textured finish and a polished gold ring detail at the waist. Sample piece — content to be replaced with the final product.', array['Scoop neckline, low back','Gold-tone ring hardware','Fully lined','Sample specification'], array['Hand wash cold','Rinse after sea or chlorine','Dry flat in the shade'], 'swimwear', (select id from public.collections where slug='the-shoreline-edit'), 14500, null, array['/images/product-shoreline-1.jpg','/images/product-shoreline-2.jpg'], '[{"name":"Ocean","hex":"#2F5E73"},{"name":"Sand","hex":"#D9C7AE"},{"name":"Ivory","hex":"#F3EEE4"}]', array['XS','S','M','L'], true, false, now() - interval '20 days'),
  ('scallop-bikini', 'Scallop Edge Bikini', 'A shell-inspired bikini with delicately scalloped edges — a nod to the house signature. Sample piece — content to be replaced with the final product.', array['Scalloped trim','Adjustable ties','Fully lined','Sample specification'], array['Hand wash cold','Rinse after use','Dry flat in the shade'], 'swimwear', (select id from public.collections where slug='the-shoreline-edit'), 12000, 9600, array['/images/product-scallop-1.jpg','/images/product-scallop-2.jpg'], '[{"name":"Sand","hex":"#D9C7AE"},{"name":"Deep Ocean","hex":"#193C46"}]', array['XS','S','M','L'], true, true, now() - interval '3 days'),
  ('golden-hour-maxi', 'Golden Hour Satin Maxi', 'A bias-cut satin maxi that catches the light as you move, with a fluid skirt and fine straps. Sample piece — content to be replaced with the final product.', array['Bias-cut satin','Adjustable straps','Side slit','Sample specification'], array['Dry clean recommended','Cool iron on reverse'], 'dresses', (select id from public.collections where slug='golden-hour'), 26000, null, array['/images/product-maxi-1.jpg','/images/product-maxi-2.jpg'], '[{"name":"Champagne","hex":"#C9A978"},{"name":"Ivory","hex":"#F3EEE4"}]', array['XS','S','M','L','XL'], true, false, now() - interval '15 days'),
  ('riviera-linen-shirt', 'Riviera Linen Shirt', 'An oversized linen shirt cut long, to be worn open over swim or tucked into tailoring. Sample piece — content to be replaced with the final product.', array['Relaxed oversized fit','Mother-of-pearl style buttons','Sample specification'], array['Machine wash 30°','Line dry','Warm iron while damp'], 'linen', (select id from public.collections where slug='riviera-linen'), 13500, null, array['/images/product-shirt-1.jpg','/images/product-shirt-2.jpg'], '[{"name":"Salt White","hex":"#FBFAF6"},{"name":"Sand","hex":"#D9C7AE"}]', array['XS','S','M','L','XL'], false, true, now() - interval '2 days'),
  ('tide-sarong', 'Tide Sheer Sarong', 'A whisper-light sheer sarong that knots at the hip and moves like water. Sample piece — content to be replaced with the final product.', array['Sheer lightweight weave','Generous wrap length','Sample specification'], array['Hand wash cold','Dry in the shade'], 'cover-ups', (select id from public.collections where slug='the-shoreline-edit'), 8500, null, array['/images/product-sarong-1.jpg','/images/product-sarong-2.jpg'], '[{"name":"Ocean","hex":"#789BA5"},{"name":"Ivory","hex":"#F3EEE4"}]', array['One Size'], false, false, now() - interval '30 days'),
  ('coastline-trouser', 'Coastline Wide-Leg Trouser', 'High-waisted, pleated wide-leg trousers in a breezy linen blend. Sample piece — content to be replaced with the final product.', array['High waist with front pleats','Wide leg','Side pockets','Sample specification'], array['Machine wash 30°','Line dry'], 'linen', (select id from public.collections where slug='riviera-linen'), 15500, 12400, array['/images/product-trouser-1.jpg','/images/product-trouser-2.jpg'], '[{"name":"Sand","hex":"#D9C7AE"},{"name":"Ivory","hex":"#F3EEE4"}]', array['XS','S','M','L','XL'], true, false, now() - interval '10 days'),
  ('pearl-shell-earrings', 'Pearl Shell Earrings', 'Sculptural gold-tone shell drops finished with a single freshwater-style pearl. Sample piece — content to be replaced with the final product.', array['Gold-tone finish','Pearl drop','Sample specification'], array['Avoid water and perfume','Store in pouch'], 'accessories', (select id from public.collections where slug='golden-hour'), 6500, null, array['/images/product-earrings-1.jpg','/images/product-earrings-2.jpg'], '[{"name":"Gold","hex":"#B79A70"}]', array['One Size'], false, true, now() - interval '1 day'),
  ('summer-straw-tote', 'Summer Straw Tote', 'A hand-woven straw tote with leather handles — roomy enough for a towel, a book and a little piece of summer. Sample piece — content to be replaced with the final product.', array['Woven straw','Leather-look handles','Sample specification'], array['Spot clean only','Keep dry'], 'accessories', (select id from public.collections where slug='riviera-linen'), 9500, null, array['/images/product-tote-1.jpg','/images/product-tote-2.jpg'], '[{"name":"Natural","hex":"#CDB48C"}]', array['One Size'], true, false, now() - interval '25 days');

insert into public.product_variants (product_id, size, colour, sku, stock)
select p.id, s.size, c->>'name',
  upper(p.slug || '-' || replace(c->>'name', ' ', '') || '-' || replace(s.size, ' ', '')),
  (abs(hashtext(p.slug || s.size || (c->>'name'))) % 9) + 2
from public.products p
cross join lateral unnest(p.sizes) as s(size)
cross join lateral jsonb_array_elements(p.colours) as c;

update public.product_variants set stock = 0
where sku in ('SCALLOP-BIKINI-SAND-XS', 'GOLDEN-HOUR-MAXI-IVORY-XL');