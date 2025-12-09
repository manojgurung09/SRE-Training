import { useEffect, useState } from 'react';
import { ShoppingCart, User, Package, DollarSign, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { Order, OrderItem, Product, Payment, User as UserType } from '../types/database';
import { formatINR } from '../lib/currency';

interface OrderWithDetails extends Order {
  items?: (OrderItem & { product?: Product })[];
  payment?: Payment;
  user?: UserType;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('📦 Fetching orders from backend API...');

      const response = await api.get<{ data: Order[] }>('/api/orders');

      if (response.data && response.data.length > 0) {
        // Backend returns orders list, fetch full details for each
        const ordersWithDetails = await Promise.all(
          response.data.map(async (order) => {
            try {
              // Fetch full order details with items and payment
              const orderDetails = await api.get<OrderWithDetails>(`/api/orders/${order.id}`);
              return orderDetails;
            } catch (err) {
              console.warn(`Failed to fetch details for order ${order.id}:`, err);
              // Return basic order if details fetch fails
              return {
                ...order,
                items: [],
                payment: undefined,
                user: undefined,
              } as OrderWithDetails;
            }
          })
        );

        console.log('✅ Orders loaded:', ordersWithDetails.length);
        setOrders(ordersWithDetails);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('💥 Error fetching orders:', error);
      alert(`Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingCart className="w-4 h-4" />
          <span>{filteredOrders.length} orders</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <StatusBadge status={order.status} />
                    {order.payment && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        order.payment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.payment.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Payment: {order.payment.status}
                      </span>
                    )}
                  </div>

                  {order.user && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <span>{order.user.full_name || order.user.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatINR(order.total_amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items?.length || 0} items
                  </div>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {item.product?.name || 'Unknown Product'}
                          </span>
                          <span className="text-gray-600 ml-2">× {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatINR(item.unit_price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.shipping_address && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{order.shipping_address}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </p>
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
