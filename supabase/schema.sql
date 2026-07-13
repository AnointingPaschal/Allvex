-- ============================================================================
-- ALLVEX PLATFORM — PRODUCTION SCHEMA (Supabase / Postgres)
-- Run this once in Supabase SQL Editor on a fresh project.
-- Then run seed.sql to load test data.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type user_role as enum ('customer', 'supplier', 'inspector', 'support', 'admin');
create type account_status as enum ('active', 'suspended');
create type vehicle_condition as enum ('new', 'used');
create type vehicle_category as enum ('SUV', 'Sedan', 'Electric', 'Pickup', 'Luxury');
create type vehicle_status as enum ('live', 'pending_inspection', 'unlisted');
create type image_category as enum ('exterior', 'interior', 'engine');
create type reminder_level as enum ('upcoming', 'due', 'overdue', 'scheduled');
create type import_stage as enum (
  'inquiry_submitted', 'quote_sent', 'deposit_paid', 'vehicle_purchased',
  'container_booked', 'container_loaded', 'at_sea', 'arrived_port',
  'customs_clearance', 'ready_for_delivery', 'delivered', 'cancelled'
);
create type supplier_status as enum ('pending_review', 'approved', 'suspended');
create type inspection_status as enum ('pending', 'in_progress', 'passed', 'minor_issues', 'not_recommended');
create type ticket_priority as enum ('low', 'medium', 'high');
create type ticket_status as enum ('open', 'in_progress', 'resolved');
create type article_status as enum ('draft', 'published');
create type order_type as enum ('accessory', 'vehicle_import');

-- ----------------------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role user_role not null default 'customer',
  status account_status not null default 'active',
  avatar_initials text,
  supplier_id uuid,        -- set only when role = 'supplier'
  inspector_id uuid,       -- set only when role = 'inspector'
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SUPPLIERS
-- ----------------------------------------------------------------------------
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  rating numeric(2,1) default 0,
  status supplier_status not null default 'pending_review',
  created_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_supplier_fk foreign key (supplier_id) references suppliers(id) on delete set null;

-- ----------------------------------------------------------------------------
-- INSPECTORS
-- ----------------------------------------------------------------------------
create table inspectors (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  location text,
  rating numeric(2,1) default 0,
  created_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_inspector_fk foreign key (inspector_id) references inspectors(id) on delete set null;

-- ----------------------------------------------------------------------------
-- VEHICLES (marketplace catalog)
-- ----------------------------------------------------------------------------
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  supplier_id uuid references suppliers(id) on delete set null,
  brand text not null,
  model text not null,
  year int not null,
  fuel text not null,
  transmission text not null,
  mileage int not null default 0,
  condition vehicle_condition not null default 'new',
  price numeric(14,2) not null,
  delivery_estimate text,
  verified boolean not null default false,
  category vehicle_category not null,
  score int check (score between 0 and 100),
  status vehicle_status not null default 'pending_inspection',
  specs jsonb not null default '{}',        -- { engine, battery, hp, range, seats, drive }
  performance jsonb not null default '{}',  -- { accel, topSpeed, charge }
  ownership jsonb not null default '{}',    -- { insurance, maintenance, running }
  features text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index vehicles_category_idx on vehicles(category);
create index vehicles_supplier_idx on vehicles(supplier_id);

create table vehicle_images (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  url text not null,
  category image_category not null,
  label text,
  position int not null default 0
);

create index vehicle_images_vehicle_idx on vehicle_images(vehicle_id);

-- ----------------------------------------------------------------------------
-- GARAGE (customer-owned vehicles)
-- ----------------------------------------------------------------------------
create table garage_vehicles (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  nickname text not null,
  brand text not null,
  model text not null,
  year int not null,
  color text,
  plate text,
  vin text,
  mileage int not null default 0,
  health_score int check (health_score between 0 and 100) default 100,
  insurance_status text,
  insurance_expiry date,
  image_url text,
  created_at timestamptz not null default now()
);

create index garage_vehicles_owner_idx on garage_vehicles(owner_id);

create table maintenance_reminders (
  id uuid primary key default uuid_generate_v4(),
  garage_vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  title text not null,
  interval_km int,
  interval_months int,
  due_date date,
  level reminder_level not null default 'upcoming',
  created_at timestamptz not null default now()
);

create index maintenance_reminders_vehicle_idx on maintenance_reminders(garage_vehicle_id);

create table garage_documents (
  id uuid primary key default uuid_generate_v4(),
  garage_vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  name text not null,
  file_type text not null default 'PDF',
  file_url text,
  uploaded_at timestamptz not null default now()
);

create table vehicle_expenses (
  id uuid primary key default uuid_generate_v4(),
  garage_vehicle_id uuid not null references garage_vehicles(id) on delete cascade,
  category text not null,   -- 'Fuel', 'Service', 'Insurance', 'Repair', etc.
  amount numeric(12,2) not null,
  note text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index vehicle_expenses_vehicle_idx on vehicle_expenses(garage_vehicle_id);

-- ----------------------------------------------------------------------------
-- IMPORT ORDERS
-- ----------------------------------------------------------------------------
create table import_orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  vehicle_label text not null,   -- denormalized snapshot, e.g. "BYD Seal Premium"
  stage import_stage not null default 'inquiry_submitted',
  eta_days int,
  progress int check (progress between 0 and 100) default 0,
  created_at timestamptz not null default now()
);

create index import_orders_customer_idx on import_orders(customer_id);

create table order_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references import_orders(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  is_current boolean not null default false,
  event_date text,   -- kept as display text ("Est. Jul 24") to match UI, not a strict timestamp
  position int not null default 0
);

create index order_timeline_events_order_idx on order_timeline_events(order_id);

create table quote_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  full_name text,
  phone text,
  budget text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ACCESSORIES + ORDERS (shop)
-- ----------------------------------------------------------------------------
create table accessories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(12,2) not null,
  rating numeric(2,1) default 0,
  image_url text,
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create table accessory_orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  total numeric(12,2) not null,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

create table accessory_order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references accessory_orders(id) on delete cascade,
  accessory_id uuid not null references accessories(id),
  quantity int not null default 1,
  unit_price numeric(12,2) not null
);

-- ----------------------------------------------------------------------------
-- INSPECTIONS
-- ----------------------------------------------------------------------------
create table inspections (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references vehicles(id) on delete set null,
  vehicle_label text not null,
  vin text,
  inspector_id uuid references inspectors(id) on delete set null,
  location text,
  status inspection_status not null default 'pending',
  checklist jsonb not null default '{}',
  notes text,
  due_label text,
  submitted_at timestamptz
);

create index inspections_inspector_idx on inspections(inspector_id);

-- ----------------------------------------------------------------------------
-- SUPPORT TICKETS
-- ----------------------------------------------------------------------------
create table support_tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text not null unique,
  customer_id uuid not null references profiles(id) on delete cascade,
  subject text not null,
  priority ticket_priority not null default 'low',
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

create table ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_role text not null,   -- 'customer' | 'agent'
  sender_id uuid references profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

create index ticket_messages_ticket_idx on ticket_messages(ticket_id);

-- ----------------------------------------------------------------------------
-- CONTENT HUB
-- ----------------------------------------------------------------------------
create table articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text,
  image_url text,
  read_time text,
  status article_status not null default 'draft',
  reads int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on notifications(user_id, read);

-- ============================================================================
-- TRIGGER: auto-create a profile row whenever a new auth.users row is created
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 2))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table suppliers enable row level security;
alter table inspectors enable row level security;
alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table garage_vehicles enable row level security;
alter table maintenance_reminders enable row level security;
alter table garage_documents enable row level security;
alter table vehicle_expenses enable row level security;
alter table import_orders enable row level security;
alter table order_timeline_events enable row level security;
alter table quote_requests enable row level security;
alter table accessories enable row level security;
alter table accessory_orders enable row level security;
alter table accessory_order_items enable row level security;
alter table inspections enable row level security;
alter table support_tickets enable row level security;
alter table ticket_messages enable row level security;
alter table articles enable row level security;
alter table notifications enable row level security;

-- Helper: current user's role
create or replace function public.current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ---- profiles ----
create policy "profiles_select_self_or_staff" on profiles for select
  using (id = auth.uid() or public.current_role() in ('admin','support'));
create policy "profiles_update_self" on profiles for update
  using (id = auth.uid());
create policy "profiles_admin_update" on profiles for update
  using (public.current_role() = 'admin');

-- ---- suppliers / inspectors (staff-readable, admin-writable) ----
create policy "suppliers_read_staff" on suppliers for select
  using (public.current_role() in ('admin','supplier','support'));
create policy "suppliers_admin_write" on suppliers for all
  using (public.current_role() = 'admin');

create policy "inspectors_read_staff" on inspectors for select
  using (public.current_role() in ('admin','inspector','support'));
create policy "inspectors_admin_write" on inspectors for all
  using (public.current_role() = 'admin');

-- ---- vehicles: public catalog read, supplier manages own, admin manages all ----
create policy "vehicles_public_read" on vehicles for select using (true);
create policy "vehicles_supplier_write_own" on vehicles for all
  using (
    public.current_role() = 'admin'
    or (public.current_role() = 'supplier' and supplier_id = (select supplier_id from profiles where id = auth.uid()))
  );

create policy "vehicle_images_public_read" on vehicle_images for select using (true);
create policy "vehicle_images_admin_write" on vehicle_images for all
  using (public.current_role() in ('admin','supplier'));

-- ---- garage: strictly owner + admin/support ----
create policy "garage_owner_all" on garage_vehicles for all
  using (owner_id = auth.uid() or public.current_role() in ('admin','support'));

create policy "reminders_via_owner" on maintenance_reminders for all
  using (
    exists (select 1 from garage_vehicles g where g.id = garage_vehicle_id
            and (g.owner_id = auth.uid() or public.current_role() in ('admin','support')))
  );

create policy "documents_via_owner" on garage_documents for all
  using (
    exists (select 1 from garage_vehicles g where g.id = garage_vehicle_id
            and (g.owner_id = auth.uid() or public.current_role() in ('admin','support')))
  );

create policy "expenses_via_owner" on vehicle_expenses for all
  using (
    exists (select 1 from garage_vehicles g where g.id = garage_vehicle_id
            and (g.owner_id = auth.uid() or public.current_role() in ('admin','support')))
  );

-- ---- import orders: owner + admin/support; suppliers see orders for their vehicles ----
create policy "orders_owner_or_staff" on import_orders for select
  using (
    customer_id = auth.uid()
    or public.current_role() in ('admin','support')
    or (public.current_role() = 'supplier' and vehicle_id in (
          select id from vehicles where supplier_id = (select supplier_id from profiles where id = auth.uid())))
  );
create policy "orders_owner_insert" on import_orders for insert
  with check (customer_id = auth.uid() or public.current_role() in ('admin','support'));
create policy "orders_staff_update" on import_orders for update
  using (public.current_role() in ('admin','support','supplier'));

create policy "timeline_via_order" on order_timeline_events for select
  using (exists (select 1 from import_orders o where o.id = order_id));
create policy "timeline_staff_write" on order_timeline_events for all
  using (public.current_role() in ('admin','support','supplier'));

create policy "quotes_owner_or_staff" on quote_requests for all
  using (
    customer_id = auth.uid()
    or public.current_role() in ('admin','support')
    or (public.current_role() = 'supplier' and vehicle_id in (
          select id from vehicles where supplier_id = (select supplier_id from profiles where id = auth.uid())))
  );

-- ---- accessories: public catalog, admin writes ----
create policy "accessories_public_read" on accessories for select using (true);
create policy "accessories_admin_write" on accessories for all
  using (public.current_role() = 'admin');

create policy "accessory_orders_owner" on accessory_orders for all
  using (customer_id = auth.uid() or public.current_role() in ('admin','support'));
create policy "accessory_order_items_via_order" on accessory_order_items for all
  using (exists (select 1 from accessory_orders o where o.id = order_id
                 and (o.customer_id = auth.uid() or public.current_role() in ('admin','support'))));

-- ---- inspections: inspector sees own, admin sees all ----
create policy "inspections_inspector_or_admin" on inspections for all
  using (
    public.current_role() = 'admin'
    or inspector_id = (select inspector_id from profiles where id = auth.uid())
  );

-- ---- support tickets ----
create policy "tickets_owner_or_staff" on support_tickets for all
  using (customer_id = auth.uid() or public.current_role() in ('admin','support'));
create policy "ticket_messages_via_ticket" on ticket_messages for all
  using (
    exists (select 1 from support_tickets t where t.id = ticket_id
            and (t.customer_id = auth.uid() or public.current_role() in ('admin','support')))
  );

-- ---- content hub: published articles public, admin manages ----
create policy "articles_public_read_published" on articles for select
  using (status = 'published' or public.current_role() = 'admin');
create policy "articles_admin_write" on articles for all
  using (public.current_role() = 'admin');

-- ---- notifications: owner only ----
create policy "notifications_owner" on notifications for all
  using (user_id = auth.uid());

-- Add gallery support to garage vehicles (run this in SQL Editor if schema already applied)
alter table garage_vehicles add column if not exists gallery_urls jsonb not null default '[]';
