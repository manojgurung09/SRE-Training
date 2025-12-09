import { Job } from 'bull';
import { getOrderQueue, getEmailQueue, OrderProcessingJob } from '../config/queue';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

const orderQueue = getOrderQueue();
const emailQueue = getEmailQueue();

if (orderQueue) {
  orderQueue.process(async (job: Job<OrderProcessingJob>) => {
    const { orderId, userId, totalAmount, items } = job.data;

    logger.info(`Processing order ${orderId} for user ${userId}`);

    try {
      await job.progress(10);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;

      await job.progress(30);

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('check_and_update_stock', {
          product_id: item.productId,
          quantity: item.quantity,
        });

        if (stockError) {
          logger.warn(`Stock check failed for product ${item.productId}:`, stockError);
        }
      }

      await job.progress(60);

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      await job.progress(80);

      if (emailQueue) {
        await emailQueue.add({
          to: `user-${userId}@example.com`,
          subject: 'Order Confirmation',
          body: `Your order ${orderId} has been received and is being processed.`,
          type: 'order_confirmation',
          orderId,
        });
      }

      await job.progress(100);

      logger.info(`Order ${orderId} processed successfully`);

      return { success: true, orderId };
    } catch (error) {
      logger.error(`Failed to process order ${orderId}:`, error);
      throw error;
    }
  });

  logger.info('Order worker started');
} else {
  logger.info('Order worker not started (WORKER_MODE is not bull-queue)');
}
