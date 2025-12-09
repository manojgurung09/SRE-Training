import { randomUUID } from 'crypto';

export function generateTestProduct() {
  return {
    name: `Test Product ${Date.now()}`,
    description: 'Test product description',
    price: Math.floor(Math.random() * 10000) + 1000,
    category: 'electronics',
    stock_quantity: 100,
    sku: `TEST-${Date.now()}`,
  };
}

export function generateTestOrder(userId: string) {
  return {
    user_id: userId,
    items: [
      {
        product_id: randomUUID(), // Will be replaced with actual product ID
        quantity: 2,
        unit_price: 4999,
      },
    ],
    shipping_address: '123 Test St, Test City, 12345',
  };
}

export function generateTestPayment(orderId: string) {
  return {
    order_id: orderId,
    amount: 9998,
    payment_method: 'credit_card',
  };
}

export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    full_name: `Test User ${timestamp}`,
  };
}

