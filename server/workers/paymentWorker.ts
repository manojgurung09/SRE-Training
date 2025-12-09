import { Job } from 'bull';
import { getPaymentQueue, getEmailQueue, PaymentProcessingJob } from '../config/queue';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

const paymentQueue = getPaymentQueue();
const emailQueue = getEmailQueue();

if (paymentQueue) {
  paymentQueue.process(async (job: Job<PaymentProcessingJob>) => {
    const { orderId, amount, paymentMethod, userId } = job.data;

    logger.info(`Processing payment for order ${orderId}: $${amount}`);

    try {
      await job.progress(20);

      const simulatedSuccess = Math.random() > 0.1;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await job.progress(50);

      if (!simulatedSuccess) {
        throw new Error('Payment gateway declined transaction');
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          amount,
          payment_method: paymentMethod,
          status: 'completed',
          transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })
        .select()
        .maybeSingle();

      if (paymentError) throw paymentError;

      await job.progress(70);

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      await job.progress(90);

      if (emailQueue) {
        await emailQueue.add({
          to: `user-${userId}@example.com`,
          subject: 'Payment Successful',
          body: `Your payment of $${amount} for order ${orderId} was successful.`,
          type: 'payment_success',
          orderId,
        });
      }

      await job.progress(100);

      logger.info(`Payment processed successfully for order ${orderId}`);

      return {
        success: true,
        paymentId: payment?.id,
        transactionId: payment?.transaction_id,
      };
    } catch (error) {
      logger.error(`Payment failed for order ${orderId}:`, error);

      await supabase.from('payments').insert({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
        status: 'failed',
        transaction_id: null,
      });

      await supabase
        .from('orders')
        .update({ status: 'payment_failed' })
        .eq('id', orderId);

      if (emailQueue) {
        await emailQueue.add({
          to: `user-${userId}@example.com`,
          subject: 'Payment Failed',
          body: `Your payment of $${amount} for order ${orderId} failed. Please try again.`,
          type: 'payment_failed',
          orderId,
        });
      }

      throw error;
    }
  });

  logger.info('Payment worker started');
} else {
  logger.info('Payment worker not started (WORKER_MODE is not bull-queue)');
}
