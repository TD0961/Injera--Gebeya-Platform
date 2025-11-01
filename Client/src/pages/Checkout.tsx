import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import ChapaPayment from "../components/ChapaPayment";
import StripePayment from "../components/StripePayment";
import bg from "../assets/hero.jpg";

export default function Checkout() {
  const { cart, getTotalPrice } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect sellers to product listing with message
  useEffect(() => {
    if (user && user.role === 'seller') {
      navigate('/products', { 
        state: { 
          message: "Sellers cannot access the checkout page. You can only manage your products and orders from your seller dashboard." 
        } 
      });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    shippingPhone: "",
    notes: "",
  });

  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'chapa' | 'stripe'>('chapa');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    
    try {
      // Create order in the database
      const orderData = {
        shipping_address: formData.shippingAddress,
        shipping_city: formData.shippingCity,
        shipping_state: formData.shippingState,
        shipping_zip: formData.shippingZip,
        shipping_phone: formData.shippingPhone,
        notes: formData.notes,
        payment_method: selectedPaymentMethod,
        payment_id: paymentData.id || paymentData.tx_ref || 'unknown',
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      console.log('Creating order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderResult = await response.json();
      console.log('Order created successfully:', orderResult);

      // Navigate to payment success page with order data
      navigate('/payment-success', {
        state: {
          paymentData,
          shippingData: formData,
          orderData: orderResult.order,
          orderTotal: getTotalPrice()
        }
      });
    } catch (error: any) {
      console.error('Failed to create order:', error);
      setError(`Payment successful but failed to create order: ${error.message}`);
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="max-w-md mx-auto py-16 px-4 text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-lg mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart before checking out.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-green-900 rounded-full font-semibold transition"
          >
            Browse Products
          </button>
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
          <button 
            onClick={() => navigate("/cart")} 
            className="p-2 hover:bg-green-700 rounded-full transition"
          >
            <ArrowLeft className="text-yellow-400" size={24} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {currentStep === 'shipping' ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="text-green-600" size={20} />
                  Shipping Information
                </h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., House No, Street, Area"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Addis Ababa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Oromia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="shippingZip"
                    value={formData.shippingZip}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="shippingPhone"
                    value={formData.shippingPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Any special delivery instructions..."
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-green-900 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl"
                  >
                    Continue to Payment
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <ArrowLeft className="text-gray-600" size={20} />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-green-600" size={20} />
                    Payment
                  </h2>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Choose Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedPaymentMethod('chapa')}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedPaymentMethod === 'chapa'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🇪🇹</div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">Chapa</div>
                          <div className="text-sm text-gray-600">Ethiopian Payment</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('stripe')}
                      className={`p-4 border-2 rounded-xl transition ${
                        selectedPaymentMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💳</div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-800">Stripe</div>
                          <div className="text-sm text-gray-600">International Cards</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Components */}
                {selectedPaymentMethod === 'chapa' ? (
                  <ChapaPayment
                    amount={getTotalPrice()}
                    phoneNumber={formData.shippingPhone}
                    shippingData={{
                      shipping_address: formData.shippingAddress,
                      shipping_city: formData.shippingCity,
                      shipping_state: formData.shippingState,
                      shipping_zip: formData.shippingZip,
                      shipping_phone: formData.shippingPhone,
                      notes: formData.notes
                    }}
                    cartItems={cart.map(item => ({
                      product_id: item.product.id,
                      quantity: item.quantity
                    }))}
                    onError={handlePaymentError}
                  />
                ) : (
                  <StripePayment
                    amount={getTotalPrice()}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="text-green-600" size={20} />
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <img
                    src={item.product.image_url || '/src/assets/enjera.jpg'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${item.product.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-800">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-green-800">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
