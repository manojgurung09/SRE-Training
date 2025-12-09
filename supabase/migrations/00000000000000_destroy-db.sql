-- ============================================================
-- Need to run manually via Supabase SQL Editor to destroy all data
-- 0. DELETE ALL SUPABASE AUTH USERS (INCLUDING ADMIN)
-- ============================================================
-- This clears the "Users" screen shown in your screenshot

DELETE FROM auth.users;


-- ============================================================
-- 1. DROP ALL RLS POLICIES (PUBLIC SCHEMA)
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname, r.tablename
    );
  END LOOP;
END $$;


-- ============================================================
-- 2. DROP ALL TABLES (PUBLIC SCHEMA)
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;


-- ============================================================
-- 3. DROP ALL SEQUENCES (PUBLIC SCHEMA)
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  )
  LOOP
    EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
  END LOOP;
END $$;


-- ============================================================
-- 4. DROP CUSTOM FUNCTIONS (SECURITY CLEANUP)
-- ============================================================

DROP FUNCTION IF EXISTS public.exec_sql(text);

-- ============================================================
-- 5. FINAL SAFETY CHECK (SHOULD RETURN 0 ROWS)
-- ============================================================

-- No public tables
SELECT * FROM pg_tables WHERE schemaname = 'public';

-- No policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- No auth users
SELECT count(*) FROM auth.users;
