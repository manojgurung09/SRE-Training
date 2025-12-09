-- =====================================================
-- Need to run manually to set appropriate RLS policies
-- 1. REQUIRED FUNCTIONS (BACKEND ONLY)
-- =====================================================

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- =====================================================
-- 2. PRODUCTS: PUBLIC READ
-- =====================================================

REVOKE ALL ON public.products FROM anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;

DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);


-- =====================================================
-- 3. USERS: FULL DEV OPEN
-- =====================================================

REVOKE ALL ON public.users FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

DROP POLICY IF EXISTS users_all_dev ON public.users;
CREATE POLICY users_all_dev
ON public.users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- =====================================================
-- 4. ORDERS: FULL DEV OPEN
-- =====================================================

REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;

DROP POLICY IF EXISTS orders_all_dev ON public.orders;
CREATE POLICY orders_all_dev
ON public.orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- =====================================================
-- 5. ORDER ITEMS: FULL DEV OPEN
-- =====================================================

REVOKE ALL ON public.order_items FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;

DROP POLICY IF EXISTS order_items_all_dev ON public.order_items;
CREATE POLICY order_items_all_dev
ON public.order_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- =====================================================
-- 6. PAYMENTS: FULL DEV OPEN
-- =====================================================

REVOKE ALL ON public.payments FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;

DROP POLICY IF EXISTS payments_all_dev ON public.payments;
CREATE POLICY payments_all_dev
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- =====================================================
-- 7. INVENTORY LOGS: READ ONLY
-- =====================================================

REVOKE ALL ON public.inventory_logs FROM anon, authenticated;
GRANT SELECT ON public.inventory_logs TO authenticated;

DROP POLICY IF EXISTS inventory_logs_read ON public.inventory_logs;
CREATE POLICY inventory_logs_read
ON public.inventory_logs
FOR SELECT
TO authenticated
USING (true);
