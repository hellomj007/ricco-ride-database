# 🚀 Database Setup Guide - RiccoRide

## Quick Setup (10 minutes total)

### Step 1: Create Supabase Account (2 minutes)
1. Go to [supabase.com](https://supabase.com)
2. Sign up with your email
3. Create a new project
4. Choose any name (e.g., "ricco-ride")
5. Create a strong password
6. Select region (choose closest to you)
7. Wait 2 minutes for setup

### Step 2: Create Database Tables (3 minutes)
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Drivers table  
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  type TEXT NOT NULL,
  owner TEXT DEFAULT 'Own',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  trip_type TEXT NOT NULL,
  route TEXT NOT NULL,
  route_type TEXT NOT NULL,
  kilometre DECIMAL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  vehicle_details TEXT,
  driver_id INTEGER REFERENCES drivers(id),
  company_id INTEGER REFERENCES companies(id),
  client_name TEXT,
  client_phone TEXT,
  vendor_name TEXT,
  vendor_share DECIMAL,
  payment_method TEXT,
  payment DECIMAL DEFAULT 0,
  driver_cost DECIMAL DEFAULT 0,
  fuel_cost DECIMAL DEFAULT 0,
  maintenance DECIMAL DEFAULT 0,
  maintenance_reason TEXT,
  toll_parking DECIMAL DEFAULT 0,
  description TEXT,
  start_date_time TIMESTAMP,
  end_date_time TIMESTAMP,
  total_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Click **"Run"**

### Step 2.5: Add Missing Columns (if upgrading existing database)
If you already have a database and need to add missing columns, run this SQL:

```sql
-- Add missing columns to existing tables
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner TEXT DEFAULT 'Own';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
```

### Step 3: Get Your Keys (1 minute)
1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: https://abc123.supabase.co)
   - **anon/public key** (long string starting with "eyJ...")

### Step 4: Update Your Code (2 minutes)
1. Open `js/database.js`
2. Replace these lines with your actual values:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Paste your Project URL here
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Paste your anon key here
```

### Step 5: Deploy to Vercel (2 minutes)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Deploy!

## ✨ That's it! Your app now works on all devices!

## How it works:
- **Offline**: Uses localStorage (current behavior)
- **Online**: Syncs with Supabase database
- **Automatic**: No changes to your daily workflow

## Migration:
- Your existing data stays in localStorage
- When online, new data goes to database
- Use migration function to move old data: `storage.migrateToDatabase()`

## Free Limits:
- **500MB database** (thousands of trips)
- **50MB file storage**
- **2 users** (perfect for small business)
- **50,000 monthly requests**

## Need help?
- Supabase docs: https://supabase.com/docs
- This setup handles 99% of small businesses needs
- Can scale to paid plans when you grow

---

**Your app now works across all devices with real-time sync!** 📱💻🔄