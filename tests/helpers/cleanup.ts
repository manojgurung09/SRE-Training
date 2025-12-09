import { supabase } from '../../server/config/supabase';

export async function cleanupTestProduct(productId: string): Promise<void> {
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (error) {
    // Ignore cleanup errors
  }
}

export async function cleanupTestOrder(orderId: string): Promise<void> {
  try {
    // Delete order_items first
    await supabase.from('order_items').delete().eq('order_id', orderId);
    // Delete payment if exists
    await supabase.from('payments').delete().eq('order_id', orderId);
    // Delete order
    await supabase.from('orders').delete().eq('id', orderId);
  } catch (error) {
    // Ignore cleanup errors
  }
}

export async function cleanupTestPayment(paymentId: string): Promise<void> {
  try {
    await supabase.from('payments').delete().eq('id', paymentId);
  } catch (error) {
    // Ignore cleanup errors
  }
}

export async function cleanupTestUser(userId: string): Promise<void> {
  try {
    // Delete from users table
    await supabase.from('users').delete().eq('id', userId);
    // Note: Auth user deletion requires admin API, handled separately
  } catch (error) {
    // Ignore cleanup errors
  }
}

