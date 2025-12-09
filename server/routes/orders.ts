import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger, logBusinessEvent } from '../config/logger';
import { orderCreatedTotal, orderValueTotal, ordersSuccessTotal, ordersFailedTotal } from '../config/metrics';
import { cacheMiddleware, invalidateCache } from '../middleware/cache';
import { queueService } from '../config/queue';

const router = Router();

router.get('/', cacheMiddleware({ ttl: 60, keyPrefix: 'orders' }), async (req: Request, res: Response) => {
  try {
    const { status, user_id, limit = '50', offset = '0' } = req.query;

    let query = supabase.from('orders').select('*');

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (user_id && typeof user_id === 'string') {
      query = query.eq('user_id', user_id);
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
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', cacheMiddleware({ ttl: 120, keyPrefix: 'order' }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', id);

    if (itemsError) throw itemsError;

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', id)
      .maybeSingle();

    if (paymentError) throw paymentError;

    res.json({
      ...order,
      items,
      payment,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, items, shipping_address } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: user_id, items' });
    }

    let totalAmount = 0;
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single();

      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) throw itemsError;

    orderCreatedTotal.inc({ status: 'pending' });
    orderValueTotal.inc(totalAmount);

    logBusinessEvent({
      type: 'order',
      action: 'created',
      metadata: {
        order_id: order.id,
        user_id,
        total_amount: totalAmount,
        items_count: items.length,
        orderStatus: order.status,
      },
    });

    await queueService.addOrderToQueue({
      orderId: order.id,
      userId: user_id,
      totalAmount,
      items: items.map((item: any) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    });

    await invalidateCache('orders:*');

    res.status(201).json(order);
    ordersSuccessTotal.inc();
  } catch (error) {
    logger.error('Error creating order', { error });
    ordersFailedTotal.inc();
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'processing' || status === 'shipped') {
      updateData.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await invalidateCache('orders:*');
    await invalidateCache(`order:*:${id}`);

    res.json(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
