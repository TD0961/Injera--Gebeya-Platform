import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Phone, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import bg from '../assets/hero.jpg';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { user, checkAuth } = useUser();
  
  // Get payment details from URL parameters or location state
  const urlParams = new URLSearchParams(location.search);
  const txRef = urlParams.get('tx_ref') || urlParams.get('reference') || 'N/A'; // Chapa might use 'reference'
  const status = urlParams.get('status') || urlParams.get('payment_status') || 'success';
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
  const [error, setError] = useState<string | null>(null);
  // const paymentData = location.state?.paymentData;
  const shippingData = location.state?.shippingData;
  const orderTotal = location.state?.orderTotal;

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
    // Ensure user is authenticated
    if (!user) {
      checkAuth();
    }
  }, [clearCart, user, checkAuth]);

  useEffect(() => {
    // Fetch order either by id or tx_ref, or verify payment
    if ((orderId || (txRef && txRef !== 'N/A')) && !orderData && !error) {
      const fetchOrder = async () => {
        setIsLoadingOrder(true);
        setError(null);
        try {
          // Ensure user is authenticated first
          if (!user) {
            await checkAuth();
            // Wait a bit for auth to complete
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // First, try to fetch order by ID or tx_ref
          let orderFound = false;
          
          if (orderId) {
            const response = await fetch(`/api/orders/${orderId}`, { 
              credentials: 'include' 
            });
            if (response.ok) {
              const result = await response.json();
              setOrderData(result.order || result);
              orderFound = true;
            } else if (response.status === 401) {
              setError('Please log in to view your order details.');
              return;
            }
          }
          
          // If order not found by ID, try by tx_ref
          if (!orderFound && txRef && txRef !== 'N/A') {
            console.log('🔍 Fetching order by tx_ref:', txRef);
            const response = await fetch(`/api/orders/tx/${encodeURIComponent(txRef)}`, { 
              credentials: 'include' 
            });
            
            if (response.ok) {
              const result = await response.json();
              setOrderData(result.order || result);
              orderFound = true;
              console.log('✅ Order found:', result.order?.order_number);
            } else if (response.status === 401) {
              console.warn('⚠️ Authentication required. Attempting to verify auth...');
              // Try to re-authenticate
              await checkAuth();
              // Wait and retry once
              await new Promise(resolve => setTimeout(resolve, 1000));
              const retryResponse = await fetch(`/api/orders/tx/${encodeURIComponent(txRef)}`, { 
                credentials: 'include' 
              });
              if (retryResponse.ok) {
                const result = await retryResponse.json();
                setOrderData(result.order || result);
                orderFound = true;
                console.log('✅ Order found after re-authentication:', result.order?.order_number);
              } else {
                setError('Please log in to view your order details. Your order has been created successfully.');
              }
              return;
            } else if (response.status === 404) {
              // Order not found - verify payment with Chapa and create order if payment successful
              console.log('📋 Order not found, verifying payment with Chapa API...');
              console.log('📋 Transaction reference:', txRef);
              
              try {
                const verifyResponse = await fetch(`/api/chapa/verify/${encodeURIComponent(txRef)}`, { 
                  credentials: 'include' 
                });
                
                if (verifyResponse.ok) {
                  const verifyResult = await verifyResponse.json();
                  console.log('✅ Payment verification result:', verifyResult);
                  
                  if (verifyResult.status === 'success' && verifyResult.order) {
                    // Order was created during verification
                    setOrderData(verifyResult.order);
                    orderFound = true;
                  } else if (verifyResult.status === 'success' && verifyResult.order_id) {
                    // Fetch the newly created order
                    const newOrderResponse = await fetch(`/api/orders/${verifyResult.order_id}`, { 
                      credentials: 'include' 
                    });
                    if (newOrderResponse.ok) {
                      const newOrderResult = await newOrderResponse.json();
                      setOrderData(newOrderResult.order || newOrderResult);
                      orderFound = true;
                    }
                  } else if (verifyResult.status !== 'success') {
                    setError(`Payment status: ${verifyResult.payment_status || verifyResult.status}`);
                    console.warn('⚠️ Payment verification indicates payment was not successful:', verifyResult);
                  }
                } else {
                  const errorData = await verifyResponse.json().catch(() => ({}));
                  console.error('❌ Payment verification failed:', errorData);
                  setError(errorData.error || 'Failed to verify payment. Please check your order history.');
                }
              } catch (verifyError: any) {
                console.error('❌ Error verifying payment:', verifyError);
                setError('Failed to verify payment. Please try again later.');
              }
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('❌ Failed to fetch order:', errorData);
              setError(errorData.error || 'Failed to load order details.');
            }
          }
          
          if (!orderFound && !error) {
            // Show transaction reference as fallback
            console.log('⚠️ Order not found, but transaction exists:', txRef);
            setError(`Order is being processed. Transaction Reference: ${txRef}. Please check your order history or contact support.`);
          }
        } catch (error: any) {
          console.error('Failed to fetch order:', error);
          setError(error.message || 'An error occurred while loading order details.');
        } finally {
          setIsLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, txRef, orderData, user, checkAuth, error]);

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
            {txRef && txRef !== 'N/A' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 inline-block">
                <p className="text-sm text-green-800">
                  <strong>Transaction Reference:</strong> <span className="font-mono">{txRef}</span>
                </p>
              </div>
            )}
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
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-red-800">Error Loading Order</h2>
              </div>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setOrderData(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Retry
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  View Order History
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Processing
              </h2>
              <p className="text-blue-700 mb-4">
                Your order is being processed. Details will appear here shortly.
              </p>
              <div className="bg-white rounded p-4 border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Transaction Reference:</strong>
                </p>
                <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                  {txRef}
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    setOrderData(null);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Refresh Order Details
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  View All Orders
                </button>
              </div>
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
