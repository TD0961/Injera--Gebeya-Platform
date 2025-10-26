import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Clock, ShoppingCart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import bg from "../assets/hero.jpg";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, resetCart, ensurePaymentDeadline, clearPaymentDeadline, getTimeLeftSeconds } = useCart();
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaymentActive, setIsPaymentActive] = useState(false);
  const navigate = useNavigate();

  // Redirect sellers to product listing with message
  useEffect(() => {
    if (user && user.role === 'seller') {
      navigate('/products', { 
        state: { 
          message: "Sellers cannot access the shopping cart. You can only manage your products and orders from your seller dashboard." 
        } 
      });
    }
  }, [user, navigate]);

  // Initialize timer when arriving with items; do not restart if deadline exists
  useEffect(() => {
    if (cart.length > 0) {
      ensurePaymentDeadline();
      setIsPaymentActive(true);
      setTimeLeft(getTimeLeftSeconds());
    } else {
      setIsPaymentActive(false);
      setTimeLeft(0);
      clearPaymentDeadline();
    }
  }, [cart.length, ensurePaymentDeadline, getTimeLeftSeconds, clearPaymentDeadline]);

  useEffect(() => {
    if (!isPaymentActive) return;

    const timer = setInterval(() => {
      const left = getTimeLeftSeconds();
      if (left <= 0) {
        setIsPaymentActive(false);
        clearPaymentDeadline();
        resetCart();
        navigate('/products');
      } else {
        setTimeLeft(left);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaymentActive, navigate, resetCart, getTimeLeftSeconds, clearPaymentDeadline]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  const total = getTotalPrice();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Header */}
      <div className="bg-green-800/95 text-white shadow-md backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-yellow-400" size={24} />
            <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">Your Cart</h1>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="w-full sm:w-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 rounded-full font-semibold transition text-sm sm:text-base"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {cart.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-center shadow-lg">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Add some delicious injera to get started!</p>
            <button
              onClick={() => navigate("/products")}
              className="w-full sm:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-green-900 rounded-full font-semibold transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Payment Timer */}
            {isPaymentActive && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 shadow-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-yellow-600" size={20} />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Payment Timer</h3>
                </div>
                <p className="text-gray-600 mb-3 text-sm sm:text-base">
                  Complete your payment within the time limit to secure your order.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className={`text-2xl sm:text-3xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {timeLeft < 300 ? 'Hurry up!' : 'Time remaining'}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.product.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg border border-yellow-500/20">
                  {/* Mobile: Stack vertically, Desktop: Horizontal */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 self-center sm:self-auto">
                      {item.product.image_url ? (
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                          <ShoppingCart className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">{item.product.name}</h3>
                      <p className="text-yellow-600 font-bold text-lg">${item.product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Stock: {item.product.stock}</p>
                  </div>

                    {/* Quantity Controls - Mobile: Full width, Desktop: Compact */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
                    <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          <Minus size={16} />
                    </button>

                        <div className="px-3 py-2 bg-yellow-100 text-green-900 font-semibold rounded-full min-w-[2.5rem] text-center">
                          {item.quantity}
                        </div>

                    <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          <Plus size={16} />
                    </button>
                      </div>

                      {/* Remove Button - Mobile: Full width, Desktop: Compact */}
                    <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="w-full sm:w-auto px-4 py-2 text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 hover:border-red-300 rounded-lg transition"
                    >
                        Remove Item
                    </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-lg border border-yellow-500/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Order Summary</h3>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">${total.toFixed(2)}</div>
            </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-semibold text-gray-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            <button
                onClick={() => navigate("/checkout")}
                className="mt-4 sm:mt-6 w-full py-3 sm:py-4 bg-yellow-500 hover:bg-yellow-600 text-green-900 rounded-xl font-bold text-base sm:text-lg transition shadow-lg hover:shadow-xl"
            >
                Proceed to Checkout
            </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
