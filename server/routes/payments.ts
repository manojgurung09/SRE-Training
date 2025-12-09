import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger, logBusinessEvent } from '../config/logger';
import { paymentProcessedTotal, paymentValueTotal, circuitBreakerOpenTotal } from '../config/metrics';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, order_id, limit = '50', offset = '0' } = req.query;

    let query = supabase.from('payments').select('*');

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (order_id && typeof order_id === 'string') {
      query = query.eq('order_id', order_id);
    }

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    query = query.range(offsetNum, offsetNum + limitNum - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      count,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { order_id, amount, payment_method } = req.body;

    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields: order_id, amount, payment_method' });
    }

    const simulateFailure = Math.random() < 0.1;

    const paymentStatus = simulateFailure ? 'failed' : 'completed';
    const transactionId = simulateFailure ? null : `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (paymentStatus === 'failed') {
      circuitBreakerOpenTotal.inc();
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id,
        amount,
        status: paymentStatus,
        payment_method,
        transaction_id: transactionId,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    if (paymentStatus === 'completed') {
      await supabase
        .from('orders')
        .update({ status: 'processing', processed_at: new Date().toISOString() })
        .eq('id', order_id);
    }

    paymentProcessedTotal.inc({ status: paymentStatus, payment_method });
    paymentValueTotal.inc({ status: paymentStatus }, amount);

    logBusinessEvent({
      type: 'payment',
      action: 'processed',
      metadata: {
        payment_id: data.id,
        order_id,
        amount,
        status: paymentStatus,
        payment_method,
        transaction_id: transactionId,
      },
    });

    res.status(201).json(data);
  } catch (error) {
    logger.error('Error creating payment', { error });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed' || status === 'failed') {
      updateData.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;
