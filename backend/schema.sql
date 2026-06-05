-- ============================================================
-- ZUNDE RaMambo — Unified Database Schema
-- Covers: Web App (Arnold) + Mobile App (Addy) + Flask API
-- ============================================================

CREATE DATABASE IF NOT EXISTS zunde;
USE zunde;

-- ── USERS ────────────────────────────────────────────────────
-- Shared between web + mobile. Populated from the AuthPortal.
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(120),
  role          ENUM('Farmer','Veterinarian','Supplier','Retailer') NOT NULL,
  org_name      VARCHAR(120),          -- farm/business/practice name
  province      VARCHAR(60),
  district      VARCHAR(60),
  address       VARCHAR(200),
  -- Farmer-specific
  farm_size_ha  DECIMAL(10,2),
  species_farmed VARCHAR(200),         -- comma-separated: Cattle,Goat,...
  -- Vet-specific
  license_number VARCHAR(60),
  speciality     VARCHAR(100),
  -- Supplier/Retailer
  business_reg   VARCHAR(60),
  supply_categories VARCHAR(200),      -- comma-separated
  trading_areas  VARCHAR(200),
  avatar_seed    VARCHAR(80),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── ANIMALS ──────────────────────────────────────────────────
-- Arnold's web app animal registry, available via API.
CREATE TABLE IF NOT EXISTS animals (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  owner_id       INT NOT NULL,         -- FK → users.id
  name           VARCHAR(80) NOT NULL,
  species        ENUM('Cattle','Goat','Sheep','Pig','Poultry') NOT NULL,
  breed          VARCHAR(80),
  birth_date     DATE,
  tag_id         VARCHAR(40),
  brand_id       VARCHAR(40),
  sire_id        VARCHAR(40),
  dam_id         VARCHAR(40),
  birth_weight   DECIMAL(8,2),
  current_weight DECIMAL(8,2),
  image_url      VARCHAR(300),
  for_sale       BOOLEAN DEFAULT FALSE,
  cost_to_date   DECIMAL(10,2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── ANIMAL WEIGHT HISTORY ────────────────────────────────────
CREATE TABLE IF NOT EXISTS weight_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  animal_id  INT NOT NULL,
  month_label VARCHAR(20),
  weight_kg  DECIMAL(8,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- ── HEALTH AUDIT LOG ─────────────────────────────────────────
-- Tracks vaccinations, treatments, diagnostics per animal.
CREATE TABLE IF NOT EXISTS health_events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  animal_id   INT NOT NULL,
  animal_name VARCHAR(80),
  event_type  VARCHAR(200) NOT NULL,   -- e.g. 'FMD Vaccine', 'Diagnostic: FMD'
  notes       TEXT,
  performed_by INT,                    -- FK → users.id (vet/farmer)
  event_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (animal_id)    REFERENCES animals(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id)   ON DELETE SET NULL
);

-- ── MEDICINE INVENTORY ───────────────────────────────────────
-- Per-farm medicine cabinet, tracks stock levels.
CREATE TABLE IF NOT EXISTS medicine_inventory (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  owner_id     INT NOT NULL,           -- FK → users.id (farmer)
  medicine_name VARCHAR(120) NOT NULL,
  stock        DECIMAL(10,2) DEFAULT 0,
  unit         VARCHAR(20) DEFAULT 'ml',
  min_stock    DECIMAL(10,2) DEFAULT 0,
  supplier     VARCHAR(100),
  price_usd    DECIMAL(10,2),
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── MARKETPLACE LISTINGS ──────────────────────────────────────
-- Addy's marketplace — covers both livestock (linked to animals)
-- and agri-produce/feed. animal_id is NULL for non-livestock items.
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,           -- FK → users.id (seller)
  animal_id    INT,                    -- FK → animals.id (NULL for feed/produce)
  product_name VARCHAR(120) NOT NULL,
  category     ENUM('livestock','feed','produce','medicine','equipment') DEFAULT 'livestock',
  price        DECIMAL(10,2) NOT NULL,
  unit         VARCHAR(30) DEFAULT 'head',
  quantity     DECIMAL(10,2) DEFAULT 1,
  location     VARCHAR(120),
  description  TEXT,
  status       ENUM('available','sold','withdrawn') DEFAULT 'available',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL
);

-- ── VET CASES / MESSAGES ─────────────────────────────────────
-- Vet Messenger cases from the web app. Also used by mobile.
CREATE TABLE IF NOT EXISTS vet_cases (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id    INT NOT NULL,           -- FK → users.id
  vet_id       INT,                    -- FK → users.id (assigned vet)
  animal_id    INT,
  category     ENUM('Emergency','Vaccination','Trade Certification','General') DEFAULT 'General',
  subject      VARCHAR(200) NOT NULL,
  province     VARCHAR(60),
  district     VARCHAR(60),
  priority     ENUM('Critical','Routine') DEFAULT 'Routine',
  status       ENUM('Pending','EMERGENCY','Certified','Closed') DEFAULT 'Pending',
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (vet_id)    REFERENCES users(id)   ON DELETE SET NULL,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  case_id     INT NOT NULL,
  sender_id   INT,                     -- NULL = system/auto-response
  sender_role ENUM('Farmer','Vet','System') DEFAULT 'Farmer',
  message     TEXT NOT NULL,
  sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id)   REFERENCES vet_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)     ON DELETE SET NULL
);

-- ── FEED TYPES (Addy's Feed Analyzer) ────────────────────────
CREATE TABLE IF NOT EXISTS feed_types (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  category         ENUM('protein','energy','roughage','mineral','mixed') DEFAULT 'mixed',
  protein_percent  DECIMAL(5,2),
  energy_mj        DECIMAL(6,2),
  fibre_percent    DECIMAL(5,2),
  calcium_percent  DECIMAL(5,2),
  phosphorus_percent DECIMAL(5,2),
  description      TEXT,
  suitable_for     VARCHAR(200)         -- comma-separated species
);

-- ── SEED DATA ─────────────────────────────────────────────────

-- Demo user: Farmer Arnold
INSERT IGNORE INTO users (id, full_name, phone, email, role, org_name, province, district, farm_size_ha, species_farmed)
VALUES (1, 'Arnold Mapindu', '+263 77 100 0001', 'arnold@example.com', 'Farmer', 'Mapindu Family Farm', 'Mashonaland West', 'Zvimba', 50.0, 'Cattle,Goat');

-- Demo user: Vet
INSERT IGNORE INTO users (id, full_name, phone, email, role, org_name, province, license_number, speciality)
VALUES (2, 'Dr T. Moyo', '+263 77 200 0002', 'tmoyo@dvs.gov.zw', 'Veterinarian', 'DVS Mashonaland West', 'Mashonaland West', 'DVS-ZIM-2024-0045', 'Tick-borne Diseases');

-- Demo user: Supplier
INSERT IGNORE INTO users (id, full_name, phone, role, org_name, province, business_reg, supply_categories)
VALUES (3, 'Chido Ncube', '+263 77 300 0003', 'Supplier', 'AgroChem Zimbabwe', 'Harare', 'BP-12345/2024', 'Vaccines,Antibiotics,Antiparasitcs');

-- Demo user: Retailer
INSERT IGNORE INTO users (id, full_name, phone, role, org_name, province, business_reg, trading_areas)
VALUES (4, 'ZimAgro Enterprise', '+263 77 400 0004', 'Retailer', 'ZimAgro Ltd', 'Harare', 'BP-67890/2023', 'Mashonaland West,Midlands,Harare');

-- Demo animals (owned by Arnold)
INSERT IGNORE INTO animals (id, owner_id, name, species, breed, birth_date, tag_id, brand_id, birth_weight, current_weight, for_sale)
VALUES
  (101, 1, 'Bessie',  'Cattle', 'Brahman', '2023-10-15', 'ZIM-882', 'AR-MP', 35, 420, FALSE),
  (102, 1, 'Thunder', 'Cattle', 'Angus',   '2024-05-20', 'ZIM-104', 'AR-MP', 32, 380, TRUE);

-- Weight history for Bessie
INSERT IGNORE INTO weight_history (animal_id, month_label, weight_kg) VALUES
  (101, 'Oct', 35), (101, 'Dec', 85), (101, 'Feb', 150),
  (101, 'Apr', 210), (101, 'Jun', 280), (101, 'Aug', 350), (101, 'Oct', 420);

-- Weight history for Thunder
INSERT IGNORE INTO weight_history (animal_id, month_label, weight_kg) VALUES
  (102, 'May', 32), (102, 'Jul', 90), (102, 'Sep', 160),
  (102, 'Nov', 240), (102, 'Jan', 310), (102, 'Mar', 380);

-- Demo health event
INSERT IGNORE INTO health_events (animal_id, animal_name, event_type, performed_by, event_date)
VALUES (101, 'Bessie', 'FMD Vaccine (Annual)', 2, '2026-02-15 10:30:00');

-- Medicine inventory for Arnold
INSERT IGNORE INTO medicine_inventory (owner_id, medicine_name, stock, unit, min_stock, supplier, price_usd)
VALUES
  (1, 'Oxytetracycline (LA)', 500, 'ml', 100, 'AgroChem Zim', 25),
  (1, 'Buparvaquone',         120, 'ml', 50,  'VetDirect',    85),
  (1, 'Albendazole',         1000, 'ml', 200, 'AgroChem Zim', 15);

-- Marketplace listing for Thunder (linked to animal)
INSERT IGNORE INTO marketplace_listings (user_id, animal_id, product_name, category, price, unit, quantity, location, description, status)
VALUES (1, 102, 'Thunder — Angus Cattle', 'livestock', 770, 'head', 1, 'Zvimba, Mashonaland West', 'Healthy 1y 9m Angus bull. DVS certified. Verified health passport.', 'available');

-- Marketplace listings from Addy's demo data
INSERT IGNORE INTO marketplace_listings (user_id, product_name, category, price, unit, quantity, location, description, status)
VALUES
  (1, 'Soya Bean Meal', 'feed',    450, 'kg', 500,  'Harare',    'High quality soya meal', 'available'),
  (1, 'Maize Grain',    'feed',    320, 'kg', 1000, 'Bulawayo',  'Fresh maize grain',      'available');

-- Feed types (for Addy's Feed Analyzer)
INSERT IGNORE INTO feed_types (id, name, category, protein_percent, energy_mj, fibre_percent, calcium_percent, phosphorus_percent, description, suitable_for) VALUES
  (1, 'Soya Bean Meal',     'protein',   45.0, 13.5, 6.0,  0.30, 0.65, 'High protein supplement — ideal for growing cattle and dairy cows.', 'Cattle,Goat'),
  (2, 'Maize Grain',        'energy',    8.5,  14.2, 2.5,  0.03, 0.28, 'Primary energy source in most livestock rations in Zimbabwe.',         'Cattle,Goat,Sheep,Pig'),
  (3, 'Cotton Seed Cake',   'protein',   38.0, 12.8, 12.0, 0.20, 0.90, 'By-product of cotton oil extraction — good rumen buffer for cattle.', 'Cattle'),
  (4, 'Sunflower Cake',     'protein',   32.0, 11.0, 15.0, 0.35, 0.95, 'Lower protein than soya but cost-effective for maintenance rations.', 'Cattle,Goat,Sheep'),
  (5, 'Wheat Bran',         'roughage',  15.5, 11.5, 10.5, 0.12, 1.10, 'Good source of phosphorus and digestible fibre for ruminants.',       'Cattle,Goat,Sheep'),
  (6, 'Dicalcium Phosphate','mineral',   0.0,  0.0,  0.0,  26.0, 18.5, 'Mineral supplement to correct calcium/phosphorus deficiencies.',      'Cattle,Goat,Sheep,Pig'),
  (7, 'Lucerne Hay',        'roughage',  17.5, 9.5,  28.0, 1.50, 0.25, 'Excellent high-protein roughage especially for dairy and young stock.','Cattle,Goat,Sheep'),
  (8, 'Commercial Grower',  'mixed',     18.0, 12.5, 7.0,  0.90, 0.70, 'Ready-mixed ration for growing cattle 6-18 months. Balanced micro-nutrients.','Cattle');
