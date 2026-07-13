-- ============================================================================
-- ALLVEX — DEMO USER SETUP
-- Run schema.sql and seed.sql FIRST.
--
-- Supabase does not allow creating auth.users rows with usable passwords via
-- plain SQL (passwords must go through Supabase's auth hashing). So:
--
-- STEP 1 — Create these 5 accounts, either by:
--   (a) Signing up through the app itself at /signup, or
--   (b) Supabase Dashboard → Authentication → Users → "Add user"
--
--   alex.johnson@allvex.app     (this becomes the demo Customer)
--   admin@allvex.app            (Administrator)
--   supplier@allvex.app         (Supplier — Guangzhou Auto Trading Co.)
--   inspector@allvex.app        (Inspector — Chinedu Obi)
--   support@allvex.app          (Customer Support agent)
--
-- Each signup automatically creates a matching row in public.profiles
-- (via the on_auth_user_created trigger in schema.sql), with role='customer'
-- by default. STEP 2 below promotes the non-customer ones and links them
-- to their supplier/inspector records, then seeds some personal demo data
-- for the customer account. Run STEP 2 only after all 5 accounts exist.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- STEP 2 — Run this after creating the 5 accounts above
-- ---------------------------------------------------------------------------

update profiles set role = 'admin'
  where email = 'admin@allvex.app';

update profiles set role = 'supplier', supplier_id = '11111111-0000-0000-0000-000000000001'
  where email = 'supplier@allvex.app';

update profiles set role = 'inspector', inspector_id = '22222222-0000-0000-0000-000000000001'
  where email = 'inspector@allvex.app';

update profiles set role = 'support'
  where email = 'support@allvex.app';

-- alex.johnson@allvex.app stays role='customer' (the default)

-- ---------------------------------------------------------------------------
-- Personal demo data for the customer account (Garage, Import order, Ticket)
-- ---------------------------------------------------------------------------

-- Garage vehicles
insert into garage_vehicles (id, owner_id, nickname, brand, model, year, color, plate, mileage, health_score, insurance_status, insurance_expiry, image_url)
select
  '55555555-0000-0000-0000-000000000001',
  id, 'My Seal', 'BYD', 'Seal Premium', 2025, 'Deep Blue', 'LND-442-KJ', 8420, 94, 'Expires in 18 days', current_date + interval '18 days',
  'https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800'
from profiles where email = 'alex.johnson@allvex.app';

insert into garage_vehicles (id, owner_id, nickname, brand, model, year, color, plate, mileage, health_score, insurance_status, image_url)
select
  '55555555-0000-0000-0000-000000000002',
  id, 'Family Prado', 'Toyota', 'Land Cruiser Prado', 2022, 'Pearl White', 'ABJ-119-XZ', 41200, 78, 'Valid',
  'https://images.pexels.com/photos/5288744/pexels-photo-5288744.jpeg?auto=compress&cs=tinysrgb&w=800'
from profiles where email = 'alex.johnson@allvex.app';

-- Maintenance reminders
insert into maintenance_reminders (garage_vehicle_id, title, interval_km, interval_months, due_date, level) values
  ('55555555-0000-0000-0000-000000000001', 'Oil Change', 5000, 6, current_date + interval '8 days', 'upcoming'),
  ('55555555-0000-0000-0000-000000000001', 'Insurance Renewal', null, null, current_date + interval '21 days', 'upcoming'),
  ('55555555-0000-0000-0000-000000000002', 'Vehicle License', null, null, current_date + interval '1 day', 'due'),
  ('55555555-0000-0000-0000-000000000002', 'Brake Inspection', 10000, null, current_date - interval '3 days', 'overdue');

-- Documents
insert into garage_documents (garage_vehicle_id, name, file_type) values
  ('55555555-0000-0000-0000-000000000001', 'Vehicle Registration', 'PDF'),
  ('55555555-0000-0000-0000-000000000001', 'Insurance Certificate', 'PDF'),
  ('55555555-0000-0000-0000-000000000001', 'Purchase Invoice', 'PDF'),
  ('55555555-0000-0000-0000-000000000001', 'Import Inspection Report', 'PDF'),
  ('55555555-0000-0000-0000-000000000001', 'Warranty Document', 'PDF');

-- Active import order + timeline
insert into import_orders (id, order_number, customer_id, vehicle_id, vehicle_label, stage, eta_days, progress)
select
  '66666666-0000-0000-0000-000000000001', 'ALX-20394', id,
  '33333333-0000-0000-0000-000000000001', 'BYD Seal Premium', 'at_sea', 18, 65
from profiles where email = 'alex.johnson@allvex.app';

insert into order_timeline_events (order_id, label, done, is_current, event_date, position) values
  ('66666666-0000-0000-0000-000000000001', 'Inquiry Submitted', true, false, 'Jun 02', 0),
  ('66666666-0000-0000-0000-000000000001', 'Quote Approved', true, false, 'Jun 05', 1),
  ('66666666-0000-0000-0000-000000000001', 'Deposit Paid', true, false, 'Jun 06', 2),
  ('66666666-0000-0000-0000-000000000001', 'Vehicle Purchased', true, false, 'Jun 14', 3),
  ('66666666-0000-0000-0000-000000000001', 'Container Loaded', true, false, 'Jun 28', 4),
  ('66666666-0000-0000-0000-000000000001', 'At Sea', true, true, 'Jul 13', 5),
  ('66666666-0000-0000-0000-000000000001', 'Arrived Destination Port', false, false, 'Est. Jul 24', 6),
  ('66666666-0000-0000-0000-000000000001', 'Customs Clearance', false, false, 'Est. Jul 28', 7),
  ('66666666-0000-0000-0000-000000000001', 'Ready for Delivery', false, false, 'Est. Aug 01', 8);

-- A support ticket from this customer
insert into support_tickets (id, ticket_number, customer_id, subject, priority, status)
select '77777777-0000-0000-0000-000000000001', 'TCK-3391', id, 'Deposit not reflecting on order', 'high', 'open'
from profiles where email = 'alex.johnson@allvex.app';

insert into ticket_messages (ticket_id, sender_role, sender_id, message)
select '77777777-0000-0000-0000-000000000001', 'customer', id,
  'Hi, I paid my deposit yesterday but the order still shows Awaiting Deposit. Can you check?'
from profiles where email = 'alex.johnson@allvex.app';
