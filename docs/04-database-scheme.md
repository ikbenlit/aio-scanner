# AIO-Scanner Database Schema - MVP Gefaseerd

## 🎯 **Schema Overview**

Gefaseerde implementatie van database schema voor efficiënte MVP development - van simpel naar complex.

---

## 📋 **Phase 1: Core Foundation (Week 1)**
*Basis functionaliteit: URL scannen + resultaten opslaan*

### **users (basis)**
```sql
CREATE TABLE users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email text UNIQUE NOT NULL,
  plan_type text DEFAULT 'free',
  credits_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### **scans (simpel)**
```sql
CREATE TABLE scans (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id bigint REFERENCES users(id), -- Nullable voor anonieme scans
  url text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  overall_score integer,
  result_json jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

### **Essential Indexes**
```sql
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_user_id ON scans(user_id);
```

**Phase 1 Goal:** Werkende scan engine die resultaten kan opslaan

---

## 📊 **Phase 2: Real-time Scanning (Week 2)**
*Live progress tracking voor 8 modules*

### **scan_modules**
```sql
CREATE TABLE scan_modules (
  scan_id bigint REFERENCES scans(id) ON DELETE CASCADE,
  module_name text NOT NULL, -- 'technical_seo', 'schema_markup', 'ai_content', etc.
  status text DEFAULT 'waiting', -- 'waiting', 'running', 'completed', 'failed'
  score integer,
  findings jsonb,
  progress integer DEFAULT 0,
  completed_at timestamptz,
  
  PRIMARY KEY (scan_id, module_name)
);
```

### **Progress Indexes**
```sql
CREATE INDEX idx_scan_modules_scan_id ON scan_modules(scan_id);
CREATE INDEX idx_scan_modules_status ON scan_modules(scan_id, status);
```

**Phase 2 Goal:** Real-time module progress via Supabase realtime

---

## 📧 **Phase 3: Email Capture (Week 3)**
*Email gate voor anonieme gebruikers*

### **scans (uitgebreid)**
```sql
-- Voeg toe aan bestaande scans tabel:
ALTER TABLE scans ADD COLUMN email_captured text;
ALTER TABLE scans ADD COLUMN email_captured_at timestamptz;
ALTER TABLE scans ADD COLUMN enforcement_key text; -- Voor rate limiting
```

### **email_scan_history**
```sql
CREATE TABLE email_scan_history (
  email text NOT NULL,
  scan_id bigint REFERENCES scans(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (email, scan_id)
);
```

### **Email Indexes**
```sql
CREATE INDEX idx_scans_email_captured ON scans(email_captured);
CREATE INDEX idx_scans_enforcement_key ON scans(enforcement_key);
```

**Phase 3 Goal:** Email capture gate met enforcement voor free tier

---

## 💳 **Phase 4: Payment Flow (Week 4)**
*Mollie integratie + credit systeem*

### **payments**
```sql
CREATE TABLE payments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id bigint REFERENCES users(id),
  mollie_payment_id text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'EUR',
  status text NOT NULL, -- 'open', 'paid', 'failed', 'canceled'
  package_type text NOT NULL, -- 'starter', 'professional'
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### **credit_transactions**
```sql
CREATE TABLE credit_transactions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id bigint REFERENCES users(id) NOT NULL,
  amount integer NOT NULL, -- Positief voor aankoop, negatief voor verbruik
  source text NOT NULL, -- 'payment', 'scan', 'bonus'
  payment_id bigint REFERENCES payments(id),
  scan_id bigint REFERENCES scans(id),
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### **Payment Indexes**
```sql
CREATE INDEX idx_payments_mollie_id ON payments(mollie_payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
```

**Phase 4 Goal:** Complete betaalflow met credit tracking

---

## 🔐 **Phase 5: Authentication & Supabase Integration (Week 5)**
*User accounts koppelen aan Supabase Auth*

### **users (volledig)**
```sql
-- Voeg toe aan bestaande users tabel:
-- Koppel aan Supabase Auth. De 'id' van auth.users is de single source of truth.
-- De password_hash wordt beheerd door Supabase Auth en hoort niet in de public tabel.
ALTER TABLE users ADD COLUMN supabase_auth_id uuid UNIQUE REFERENCES auth.users(id);
ALTER TABLE users ADD COLUMN grandfathered boolean DEFAULT false;
```

### **payments (webhook tracking)**
```sql
-- Voeg toe voor idempotentie:
ALTER TABLE payments ADD COLUMN webhook_processed_at timestamptz;
ALTER TABLE payments ADD COLUMN webhook_attempts integer DEFAULT 0;
```

### **Auth Indexes**
```sql
CREATE INDEX idx_users_supabase_auth_id ON users(supabase_auth_id);
```

**Phase 5 Goal:** User accounts met login/logout functionaliteit

---

## ⚡ **Business Logic per Phase**

### **Phase 1: Basic Scanning**
```sql
-- Simpele scan opslag
INSERT INTO scans (url, status, result_json) 
VALUES (?, 'completed', ?);
```

### **Phase 2: Progress Tracking**
```sql
-- Module progress update
UPDATE scan_modules 
SET status = 'completed', score = 85, progress = 100 
WHERE scan_id = ? AND module_name = ?;
```

### **Phase 3: Email Enforcement**
```sql
-- Free tier check
SELECT COUNT(*) FROM scans 
WHERE email_captured = ? OR enforcement_key = ?;
```

### **Phase 4: Credit Management**
```sql
-- Credit purchase
INSERT INTO credit_transactions (user_id, amount, source, payment_id)
VALUES (?, 2, 'payment', ?);

UPDATE users SET credits_balance = credits_balance + 2 WHERE id = ?;
```

### **Phase 5: Account Linking**
```sql
-- Link anonieme scans aan nieuwe account
UPDATE scans SET user_id = ? 
WHERE email_captured = ? AND user_id IS NULL;
```

---

## 🚀 **Migration Strategy**

### **Week 1: Foundation**
```sql
-- migrations/001_create_users_and_scans.sql
CREATE TABLE users (...);
CREATE TABLE scans (...);
```

### **Week 2: Modules**
```sql
-- migrations/002_add_scan_modules.sql
CREATE TABLE scan_modules (...);
```

### **Week 3: Email Capture**
```sql
-- migrations/003_add_email_tracking.sql
ALTER TABLE scans ADD COLUMN email_captured text;
CREATE TABLE email_scan_history (...);
```

### **Week 4: Payments**
```sql
-- migrations/004_add_payments.sql
CREATE TABLE payments (...);
CREATE TABLE credit_transactions (...);
```

### **Week 5: Authentication**
```sql
-- migrations/005_add_auth_fields.sql
-- Koppel public.users aan Supabase's auth.users en verwijder overbodige velden
ALTER TABLE users ADD COLUMN supabase_auth_id uuid UNIQUE REFERENCES auth.users(id);
ALTER TABLE payments ADD COLUMN webhook_processed_at timestamptz;
```

---

## 🎯 **MVP Success Criteria per Phase**

**Phase 1:** ✅ URL scan → JSON result opgeslagen  
**Phase 2:** ✅ Real-time module progress in frontend  
**Phase 3:** ✅ Email gate blokkeert tweede gratis scan  
**Phase 4:** ✅ Mollie payment → credits toegevoegd  
**Phase 5:** ✅ Login → dashboard met scan geschiedenis  

## 📊 **Final Schema Stats**
- **Tables:** 6 core tables
- **Relationships:** Clean foreign keys
- **Indexes:** Performance-optimized
- **Scalability:** Ready voor uitbreiding post-MVP

**Status:** 🚀 Ready voor Supabase implementatie