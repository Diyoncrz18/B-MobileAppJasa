-- ============================================================
-- SmartEco Service — PostgreSQL Schema (Supabase)
-- ============================================================

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  auth_uid      UUID UNIQUE,                       -- links to Supabase auth.users
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'user',       -- user | admin | provider
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. addresses
CREATE TABLE IF NOT EXISTS addresses (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  address_line  TEXT NOT NULL,
  city          TEXT NOT NULL,
  province      TEXT NOT NULL,
  postal_code   TEXT,
  is_primary    BOOLEAN NOT NULL DEFAULT false
);

-- 3. service_categories
CREATE TABLE IF NOT EXISTS service_categories (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  icon          TEXT NOT NULL,
  eco_score     TEXT NOT NULL,
  tone          TEXT NOT NULL,
  price_label   TEXT NOT NULL
);

-- 4. services
CREATE TABLE IF NOT EXISTS services (
  id              SERIAL PRIMARY KEY,
  category_id     INT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  about           TEXT NOT NULL,
  duration        TEXT NOT NULL,
  price           TEXT NOT NULL,
  eco_score       TEXT NOT NULL,
  guarantee       TEXT NOT NULL,
  coverage        TEXT NOT NULL,
  response        TEXT NOT NULL,
  jobs            TEXT NOT NULL,
  rating          TEXT NOT NULL,
  benefits_json   JSONB NOT NULL DEFAULT '[]',
  includes_json   JSONB NOT NULL DEFAULT '[]',
  process_json    JSONB NOT NULL DEFAULT '[]',
  reviews_json    JSONB NOT NULL DEFAULT '[]'
);

-- 5. providers
CREATE TABLE IF NOT EXISTS providers (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  company         TEXT NOT NULL,
  address         TEXT NOT NULL,
  distance        TEXT NOT NULL,
  eta             TEXT NOT NULL,
  response        TEXT NOT NULL,
  jobs            TEXT NOT NULL,
  rating          TEXT NOT NULL,
  price           TEXT NOT NULL,
  availability    TEXT NOT NULL,
  tags_json       JSONB NOT NULL DEFAULT '[]',
  is_recommended  BOOLEAN NOT NULL DEFAULT false
);

-- 6. provider_services
CREATE TABLE IF NOT EXISTS provider_services (
  id              SERIAL PRIMARY KEY,
  provider_id     INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id      INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE (provider_id, service_id)
);

-- 7. diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id                  SERIAL PRIMARY KEY,
  user_id             INT REFERENCES users(id) ON DELETE SET NULL,
  service_id          INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  urgency             TEXT NOT NULL,
  location_text       TEXT,
  scheduled_at        TIMESTAMPTZ,
  recommendation      TEXT,
  estimated_price     TEXT,
  estimated_duration  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. orders
CREATE TABLE IF NOT EXISTS orders (
  id                    SERIAL PRIMARY KEY,
  code                  TEXT NOT NULL UNIQUE,
  user_id               INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id            INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  provider_id           INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  address_id            INT NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
  diagnosis_id          INT REFERENCES diagnoses(id) ON DELETE SET NULL,
  status                TEXT NOT NULL,
  scheduled_at          TIMESTAMPTZ NOT NULL,
  problem_description   TEXT NOT NULL,
  service_fee           INT NOT NULL,
  visit_fee             INT NOT NULL,
  material_fee_estimate INT NOT NULL DEFAULT 0,
  total_estimate        INT NOT NULL,
  total_final           INT NOT NULL,
  payment_method        TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. order_tracking_events
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT NOT NULL,
  happened_at TIMESTAMPTZ,
  sort_order  INT NOT NULL
);

-- 10. payments
CREATE TABLE IF NOT EXISTS payments (
  id        SERIAL PRIMARY KEY,
  order_id  INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method    TEXT NOT NULL,
  amount    INT NOT NULL,
  status    TEXT NOT NULL,
  note      TEXT,
  paid_at   TIMESTAMPTZ
);

-- 11. reviews
CREATE TABLE IF NOT EXISTS reviews (
  id                  SERIAL PRIMARY KEY,
  order_id            INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id          INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  provider_id         INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_rating      INT NOT NULL,
  timeliness_rating   INT NOT NULL,
  quality_rating      INT NOT NULL,
  friendliness_rating INT NOT NULL,
  review_text         TEXT,
  created_at          TIMESTAMPTZ NOT NULL
);

-- 12. partner_applications
CREATE TABLE IF NOT EXISTS partner_applications (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  area            TEXT NOT NULL,
  field           TEXT NOT NULL,
  experience      TEXT NOT NULL,
  description     TEXT NOT NULL,
  address         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  documents_json  JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. complaints
CREATE TABLE IF NOT EXISTS complaints (
  id              SERIAL PRIMARY KEY,
  user_name       TEXT NOT NULL,
  title           TEXT NOT NULL,
  complaint       TEXT NOT NULL,
  service         TEXT NOT NULL,
  vendor          TEXT NOT NULL,
  priority        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL
);

-- 15. education_contents
CREATE TABLE IF NOT EXISTS education_contents (
  id        SERIAL PRIMARY KEY,
  category  TEXT NOT NULL,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  icon      TEXT NOT NULL,
  tone      TEXT NOT NULL
);

-- 16. payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 17. chat_threads
CREATE TABLE IF NOT EXISTS chat_threads (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT NOT NULL,
  time_label    TEXT NOT NULL,
  unread_count  INT NOT NULL DEFAULT 0,
  pinned        BOOLEAN NOT NULL DEFAULT false
);

-- 18. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id          SERIAL PRIMARY KEY,
  thread_id   INT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- Enable RLS on all tables (Supabase best practice)
-- Service-role key bypasses RLS automatically
-- ============================================================
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services               ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_contents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages          ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog tables
CREATE POLICY "Public read service_categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Public read services"           ON services           FOR SELECT USING (true);
CREATE POLICY "Public read providers"          ON providers          FOR SELECT USING (true);
CREATE POLICY "Public read provider_services"  ON provider_services  FOR SELECT USING (true);
CREATE POLICY "Public read education_contents" ON education_contents FOR SELECT USING (true);
CREATE POLICY "Public read payment_methods"    ON payment_methods    FOR SELECT USING (true);
