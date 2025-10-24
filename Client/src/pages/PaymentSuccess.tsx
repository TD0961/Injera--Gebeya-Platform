import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Phone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import bg from '../assets/hero.jpg';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  
  // Get payment details from URL parameters or location state
  const urlParams = new URLSearchParams(location.search);
  const txRef = urlParams.get('tx_ref') || 'N/A';
  const status = urlParams.get('status') || 'success';
  const orderId = urlParams.get('order_id');
  
  // Debug logging
  console.log('🔍 PaymentSuccess component loaded');
  console.log('📍 Current URL:', window.location.href);
  console.log('🔗 URL Parameters:', {
    txRef,
    status,
    orderId,
    search: location.search
  });
  
  // Get order data from location state (passed from checkout) or fetch from API
  const [orderData, setOrderData] = useState(location.state?.orderData);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  // const paymentData = location.state?.paymentData;
  const shippingData = location.state?.shippingData;
  const orderTotal = location.state?.orderTotal;

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Fetch order either by id or tx_ref
    if ((orderId || (txRef && txRef !== 'N/A')) && !orderData) {
      const fetchOrder = async () => {
        setIsLoadingOrder(true);
        try {
          const url = orderId
            ? `http://localhost:3000/api/orders/${orderId}`
            : `http://localhost:3000/api/orders/tx/${encodeURIComponent(txRef)}`;
          const response = await fetch(url, { credentials: 'include' });
          if (response.ok) {
            const result = await response.json();
            setOrderData(result.order || result);
          }
        } catch (error) {
          console.error('Failed to fetch order:', error);
        } finally {
          setIsLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, txRef, orderData]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto text-green-500 mb-6" size={64} />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase! Your order has been created and payment processed successfully.
            </p>
          </div>

          {/* Order Information */}
          {isLoadingOrder ? (
            <div className="text-center text-gray-600 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              Loading order details...
            </div>
          ) : orderData ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Order Number:</strong> {orderData.OrderNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> <span className="text-yellow-600 font-medium">Pending</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Payment Method:</strong> {orderData.PaymentMethod?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> ${orderData.Total?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Items:</strong> {orderData.OrderItems?.length || 0} product(s)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Information
              </h2>
              <p className="text-gray-600">Order details will be available shortly...</p>
            </div>
          )}

          {/* Shipping Information */}
          {shippingData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {shippingData.shippingAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>City:</strong> {shippingData.shippingCity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>State:</strong> {shippingData.shippingState}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <strong>Phone:</strong> {shippingData.shippingPhone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Transaction Reference:</strong> {txRef}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> <span className="text-green-600 font-medium">Success</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> ${orderData?.Total?.toFixed(2) || orderTotal?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              Track Your Order
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
