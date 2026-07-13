-- ============================================================================
-- ALLVEX — CATALOG SEED DATA
-- Run this AFTER schema.sql. Safe to run standalone — no auth.users dependency.
-- ============================================================================

-- ---- Suppliers ----
insert into suppliers (id, company_name, rating, status) values
  ('11111111-0000-0000-0000-000000000001', 'Guangzhou Auto Trading Co.', 4.8, 'approved'),
  ('11111111-0000-0000-0000-000000000002', 'Shenzhen EV Exports Ltd.', 4.6, 'approved'),
  ('11111111-0000-0000-0000-000000000003', 'Jiangsu Motor Group', 4.1, 'pending_review');

-- ---- Inspectors ----
insert into inspectors (id, full_name, location, rating) values
  ('22222222-0000-0000-0000-000000000001', 'Chinedu Obi', 'Lagos Port', 4.9),
  ('22222222-0000-0000-0000-000000000002', 'Fatima Sule', 'Apapa', 4.7),
  ('22222222-0000-0000-0000-000000000003', 'Emeka Nwosu', 'Tin Can Island', 4.5);

-- ---- Vehicles ----
insert into vehicles (id, supplier_id, brand, model, year, fuel, transmission, mileage, condition, price, delivery_estimate, verified, category, score, status, specs, performance, ownership, features) values
(
  '33333333-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000002',
  'BYD', 'Seal Premium', 2025, 'Electric', 'Automatic', 0, 'new', 32500000, '35–45 Days', true, 'Electric', 91, 'live',
  '{"engine":"Dual Motor AWD","battery":"82.5 kWh","hp":"530 hp","range":"570 km","seats":5,"drive":"AWD"}',
  '{"accel":"3.8s 0–100km/h","topSpeed":"180 km/h","charge":"26 min (10-80%)"}',
  '{"insurance":850000,"maintenance":300000,"running":180000}',
  array['Adaptive Cruise','Panoramic Roof','Wireless Charging','Apple CarPlay','Lane Assist','360 Camera']
),
(
  '33333333-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000001',
  'GAC', 'GS8', 2024, 'Petrol', 'Automatic', 0, 'new', 28900000, '30–40 Days', true, 'SUV', 86, 'live',
  '{"engine":"2.0T Turbo","battery":"—","hp":"248 hp","range":"—","seats":7,"drive":"AWD"}',
  '{"accel":"8.5s 0–100km/h","topSpeed":"195 km/h","charge":"—"}',
  '{"insurance":620000,"maintenance":240000,"running":210000}',
  array['Panoramic Roof','Apple CarPlay','Android Auto','Parking Sensors','ADAS']
),
(
  '33333333-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000003',
  'Chery', 'Tiggo 8 Pro', 2024, 'Petrol', 'Automatic', 0, 'new', 19800000, '25–35 Days', true, 'SUV', 82, 'live',
  '{"engine":"1.6T","battery":"—","hp":"197 hp","range":"—","seats":7,"drive":"FWD"}',
  '{"accel":"9.7s 0–100km/h","topSpeed":"185 km/h","charge":"—"}',
  '{"insurance":480000,"maintenance":190000,"running":160000}',
  array['Leather Seats','Sunroof','Android Auto','Parking Camera']
),
(
  '33333333-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000002',
  'XPeng', 'P7', 2025, 'Electric', 'Automatic', 0, 'new', 35200000, '40–50 Days', false, 'Electric', 88, 'pending_inspection',
  '{"engine":"Rear Motor","battery":"80.9 kWh","hp":"469 hp","range":"610 km","seats":5,"drive":"RWD"}',
  '{"accel":"4.3s 0–100km/h","topSpeed":"170 km/h","charge":"29 min (10-80%)"}',
  '{"insurance":900000,"maintenance":280000,"running":170000}',
  array['ADAS','Wireless Charging','Panoramic Roof','Lane Keeping Assist']
);

-- ---- Vehicle images (real stock photography — Pexels, free-use license) ----
insert into vehicle_images (vehicle_id, url, category, label, position) values
-- BYD Seal Premium
('33333333-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Front', 0),
('33333333-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/36718056/pexels-photo-36718056.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Rear', 1),
('33333333-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/36718053/pexels-photo-36718053.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Dashboard', 2),
('33333333-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/36646941/pexels-photo-36646941.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Seats', 3),
('33333333-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/16545849/pexels-photo-16545849.jpeg?auto=compress&cs=tinysrgb&w=800', 'engine', 'Engine Bay', 4),
-- GAC GS8
('33333333-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/30795598/pexels-photo-30795598.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Front', 0),
('33333333-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/36718056/pexels-photo-36718056.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Rear', 1),
('33333333-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/36718053/pexels-photo-36718053.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Dashboard', 2),
('33333333-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/36646941/pexels-photo-36646941.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Seats', 3),
('33333333-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/16545849/pexels-photo-16545849.jpeg?auto=compress&cs=tinysrgb&w=800', 'engine', 'Engine Bay', 4),
-- Chery Tiggo 8 Pro
('33333333-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/14776590/pexels-photo-14776590.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Front', 0),
('33333333-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/36718056/pexels-photo-36718056.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Rear', 1),
('33333333-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/36718053/pexels-photo-36718053.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Dashboard', 2),
('33333333-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/36646941/pexels-photo-36646941.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Seats', 3),
('33333333-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/16545849/pexels-photo-16545849.jpeg?auto=compress&cs=tinysrgb&w=800', 'engine', 'Engine Bay', 4),
-- XPeng P7
('33333333-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/16490609/pexels-photo-16490609.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Front', 0),
('33333333-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/36718056/pexels-photo-36718056.jpeg?auto=compress&cs=tinysrgb&w=800', 'exterior', 'Rear', 1),
('33333333-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/36718053/pexels-photo-36718053.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Dashboard', 2),
('33333333-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/36646941/pexels-photo-36646941.jpeg?auto=compress&cs=tinysrgb&w=800', 'interior', 'Seats', 3),
('33333333-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/16545849/pexels-photo-16545849.jpeg?auto=compress&cs=tinysrgb&w=800', 'engine', 'Engine Bay', 4);

-- ---- Accessories ----
insert into accessories (id, name, price, rating, image_url, stock) values
  ('44444444-0000-0000-0000-000000000001', '4K Dashcam', 85000, 4.8, 'https://images.pexels.com/photos/14776593/pexels-photo-14776593.jpeg?auto=compress&cs=tinysrgb&w=400', 42),
  ('44444444-0000-0000-0000-000000000002', 'OBD-II Scanner', 42000, 4.6, 'https://images.pexels.com/photos/12271951/pexels-photo-12271951.jpeg?auto=compress&cs=tinysrgb&w=400', 30),
  ('44444444-0000-0000-0000-000000000003', 'Jump Starter Pro', 55000, 4.7, 'https://images.pexels.com/photos/12920605/pexels-photo-12920605.jpeg?auto=compress&cs=tinysrgb&w=400', 18);

-- ---- Articles ----
insert into articles (title, body, image_url, read_time, status, reads) values
  ('Best SUVs Under ₦25m in 2026', 'A look at the strongest value SUVs currently importable through Allvex...', 'https://images.pexels.com/photos/14776592/pexels-photo-14776592.jpeg?auto=compress&cs=tinysrgb&w=600', '6 min read', 'published', 12400),
  ('Should You Buy an Electric Vehicle in Nigeria?', 'Charging infrastructure, running costs, and what to expect owning an EV...', 'https://images.pexels.com/photos/11589801/pexels-photo-11589801.jpeg?auto=compress&cs=tinysrgb&w=600', '8 min read', 'published', 8100),
  ('BYD vs Toyota: Ownership Cost Compared', 'Insurance, maintenance and resale — how these two brands compare...', 'https://images.pexels.com/photos/27502215/pexels-photo-27502215.jpeg?auto=compress&cs=tinysrgb&w=600', '5 min read', 'draft', 0);
