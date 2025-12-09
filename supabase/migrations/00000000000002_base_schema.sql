-- ==========================================================
-- Will run automatically using npm run db:init
-- FINAL CANONICAL BASE SCHEMA FOR BHARATMART (DEV SAFE)
-- ==========================================================

-- ---------- EXTENSIONS ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  address text,
  phone text,
  role text DEFAULT 'customer',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ---------- PRODUCTS ----------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text,
  image_url text,
  is_active boolean DEFAULT true,

  -- Seed-driven columns
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------- ORDERS ----------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  total_amount numeric DEFAULT 0,

  -- Seed-driven columns
  shipping_address text,
  processed_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------- ORDER ITEMS ----------
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ---------- PAYMENTS ----------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',

  -- Seed-driven columns
  payment_method text,
  transaction_id text,
  processed_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------- INVENTORY LOGS ----------
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,

  -- New canonical fields
  previous_quantity integer DEFAULT 0,
  new_quantity integer DEFAULT 0,
  change_reason text,

  -- Legacy compatibility
  change integer,

  created_at timestamptz DEFAULT now()
);

-- ---------- UPDATED_AT TRIGGERS ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------- INVENTORY CHANGE AUTO-COMPUTE ----------
CREATE OR REPLACE FUNCTION public.auto_compute_inventory_change()
RETURNS trigger AS $$
BEGIN
  NEW.change := COALESCE(NEW.new_quantity, 0) - COALESCE(NEW.previous_quantity, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_logs_change ON public.inventory_logs;
CREATE TRIGGER trg_inventory_logs_change
BEFORE INSERT ON public.inventory_logs
FOR EACH ROW
EXECUTE FUNCTION public.auto_compute_inventory_change();

-- ---------- ENABLE RLS (SAFE DEFAULT) ----------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- ---------- DEV-SAFE SERVICE ROLE OVERRIDE (PG14 SAFE) ----------
DO $$
DECLARE
  r RECORD;
  policy_count INTEGER;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = r.tablename
      AND policyname = 'service_role_all_' || r.tablename;

    IF policy_count = 0 THEN
      EXECUTE format(
        'CREATE POLICY service_role_all_%I
         ON public.%I
         FOR ALL
         TO service_role
         USING (true)
         WITH CHECK (true);',
        r.tablename, r.tablename
      );
    END IF;
  END LOOP;
END $$;


-- ✅ FORCE TABLE OWNERSHIP (CRITICAL FOR 42501 SAFETY)
ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.products OWNER TO postgres;
ALTER TABLE public.orders OWNER TO postgres;
ALTER TABLE public.order_items OWNER TO postgres;
ALTER TABLE public.payments OWNER TO postgres;
ALTER TABLE public.inventory_logs OWNER TO postgres;


-- ✅ PERMANENT PERMISSION SAFETY (CRITICAL)

-- Schema access
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Backend full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Frontend public product read
GRANT SELECT ON public.products TO anon, authenticated;

-- Future tables safety
ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;

GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.inventory_logs TO authenticated;
