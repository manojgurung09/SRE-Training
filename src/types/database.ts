export interface User {
  id: string;
  email: string;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock_quantity: number;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  change_reason: string;
  created_at: string;
}

export interface ApiEvent {
  id: string;
  event_type: string;
  endpoint: string | null;
  method: string | null;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
}

export interface SREMetrics {
  availability: number;
  errorRate: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}
