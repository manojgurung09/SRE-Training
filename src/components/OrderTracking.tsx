import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { formatINR } from '../lib/currency';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address?: any;
  items?: any[];
  payment?: any;
}

interface OrderTrackingProps {
  orderId?: string;
  onBack: () => void;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  processing: {
    label: 'Processing',
    icon: Package,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  payment_failed: {
    label: 'Payment Failed',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export function OrderTracking({ orderId, onBack }: OrderTrackingProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        fetchOrderDetails(orderId);
      }
    }
  }, [orderId, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Order[] }>('/api/orders', {
        user_id: user?.id,
      });

      if (response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      // Backend returns full order details with items and payment
      const orderDetails = await api.get<Order & { items: any[]; payment: any }>(`/api/orders/${id}`);

      setSelectedOrder({
        ...orderDetails,
        items: orderDetails.items || [],
        payment: orderDetails.payment,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">Please sign in to view your orders</p>
      </div>
    );
  }

  if (selectedOrder) {
    const config = statusConfig[selectedOrder.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div>
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Orders</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id.slice(0, 8)}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${config.border} ${config.bg} flex items-center gap-2`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
              <span className={`font-semibold ${config.color}`}>{config.label}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
              {selectedOrder.shipping_address ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{selectedOrder.shipping_address.fullName}</p>
                  <p>{selectedOrder.shipping_address.address}</p>
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.zipCode}</p>
                  <p>{selectedOrder.shipping_address.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No address provided</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
              {selectedOrder.payment ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${
                      selectedOrder.payment.status === 'completed' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedOrder.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {selectedOrder.payment.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedOrder.payment.transaction_id && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-xs text-gray-900">
                        {selectedOrder.payment.transaction_id.slice(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Payment pending</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {selectedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {item.products?.name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.products?.name || 'Product'}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatINR(item.unit_price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatINR(item.unit_price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{formatINR(selectedOrder.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Products</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-2">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => fetchOrderDetails(order.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatINR(order.total_amount)}</p>
                      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
