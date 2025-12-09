-- ================================
--- Need to run manually to seed initial data
-- USERS
-- ================================
INSERT INTO public.users (id, email, full_name, role)
VALUES
('bbbbbbbb-2222-2222-2222-222222222222', 'rajesh@example.com', 'Rajesh Kumar', 'customer'),
('cccccccc-3333-3333-3333-333333333333', 'priya@example.com', 'Priya Sharma', 'customer');

-- ================================
-- PRODUCTS
-- ================================
INSERT INTO public.products
(id, name, description, price, category, stock_quantity, sku)
VALUES
('dddddddd-4444-4444-4444-444444444444', 'iPhone 15', 'Apple smartphone', 79999, 'electronics', 20, 'APL-IP15'),
('eeeeeeee-5555-5555-5555-555555555555', 'Samsung TV', '55 inch 4K TV', 55999, 'electronics', 15, 'SMS-TV55'),
('ffffffff-6666-6666-6666-666666666666', 'Nike Shoes', 'Running shoes', 4999, 'fashion', 50, 'NKE-RUN');

-- ================================
-- ORDERS
-- ================================
INSERT INTO public.orders
(id, user_id, status, total_amount, shipping_address)
VALUES
('11111111-aaaa-bbbb-cccc-111111111111',
 'bbbbbbbb-2222-2222-2222-222222222222',
 'pending',
 79999,
 'Delhi, India');

-- ================================
-- PAYMENTS
-- ================================
INSERT INTO public.payments
(id, order_id, amount, status, payment_method, transaction_id)
VALUES
('22222222-aaaa-bbbb-cccc-222222222222',
 '11111111-aaaa-bbbb-cccc-111111111111',
 79999,
 'success',
 'card',
 'TXN123456');

-- ================================
-- INVENTORY LOG
-- ================================
INSERT INTO public.inventory_logs
(id, product_id, previous_quantity, new_quantity, change_reason)
VALUES
('33333333-aaaa-bbbb-cccc-333333333333',
 'dddddddd-4444-4444-4444-444444444444',
 20,
 19,
 'order_placed');
