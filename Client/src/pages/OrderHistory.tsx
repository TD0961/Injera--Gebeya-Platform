import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, Eye, RefreshCw, MapPin, Phone, RotateCcw } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import bg from '../assets/hero.jpg';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: number;
    name: string;
    image_url: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_phone: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock, 
    label: 'Pending',
    description: 'Your order is being reviewed'
  },
  confirmed: { 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle, 
    label: 'Confirmed',
    description: 'Your order has been confirmed and is being prepared'
  },
  shipped: { 
    color: 'bg-indigo-100 text-indigo-800', 
    icon: Truck, 
    label: 'Shipped',
    description: 'Your order is on the way'
  },
  delivered: { 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle, 
    label: 'Delivered',
    description: 'Your order has been delivered'
  },
  cancelled: { 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle, 
    label: 'Cancelled',
    description: 'Your order has been cancelled'
  },
};

const paymentStatusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
  failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
  refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
};

export default function OrderHistory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    
    // Auto-refresh every 30 seconds to keep orders in sync
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/orders', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      console.log(`📦 Loaded ${data.orders.length} orders for buyer`);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Failed to fetch orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusProgress = (status: string) => {
    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? currentIndex + 1 : 0;
  };

  const getStatusDescription = (status: string) => {
    const descriptions = {
      pending: 'Order received, awaiting seller confirmation',
      confirmed: 'Order confirmed by seller and being prepared',
      shipped: 'Order shipped and on the way to you',
      delivered: 'Order successfully delivered to you',
      cancelled: 'Order has been cancelled',
    };
    return descriptions[status as keyof typeof descriptions] || 'Unknown status';
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Header */}
      <div className="bg-green-800/95 text-white shadow-md backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-6 py-3 sm:py-4">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-green-700 rounded-full transition">
            <ArrowLeft className="text-yellow-400" size={24} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">Order History</h1>
            <p className="text-sm text-green-100">Track your orders and deliveries</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 hover:bg-green-700 rounded-full transition disabled:opacity-50"
            title="Refresh orders"
          >
            <RotateCcw className={`text-yellow-400 ${loading ? 'animate-spin' : ''}`} size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const progress = getStatusProgress(order.status);
              
              return (
                <div key={order.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order #{order.order_number}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="inline w-3 h-3 mr-1" />
                          {statusConfig[order.status].label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[order.payment_status].color}`}>
                          {paymentStatusConfig[order.payment_status].label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                        <p><strong>Items:</strong> {order.order_items.length} product(s)</p>
                        <p><strong>Payment:</strong> {order.payment_method.toUpperCase()}</p>
                      </div>

                      {/* Order Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Order Progress</span>
                          <span>{progress}/4</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress / 4) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {getStatusDescription(order.status)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        <Eye className="w-4 h-4 mr-1 inline" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order #{selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Order Details */}
              <div className="space-y-6">
                {/* Order Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Order Status</h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedOrder.status].color}`}>
                      <StatusIcon className="inline w-4 h-4 mr-1" />
                      {statusConfig[selectedOrder.status].label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusConfig[selectedOrder.payment_status].color}`}>
                      {paymentStatusConfig[selectedOrder.payment_status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {statusConfig[selectedOrder.status].description}
                  </p>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p>{selectedOrder.shipping_address}</p>
                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                    <p className="flex items-center gap-1 mt-2">
                      <Phone className="w-4 h-4" />
                      {selectedOrder.shipping_phone}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image_url || '/src/assets/enjera.jpg'}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">${item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping:</span>
                      <span>${selectedOrder.shipping_fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Payment Method:</span>
                      <span>{selectedOrder.payment_method.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
