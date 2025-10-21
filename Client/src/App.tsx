import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import BuyerSignup from './pages/BuyerSignup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SellerSignup from './pages/SellerSignup';
import SellerDashboard from './pages/SellerDashboard';
import ProductListing from './pages/ProductListing';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import SellerOrders from './pages/SellerOrders';
import OrderHistory from './pages/OrderHistory';
import EmailVerification from './pages/EmailVerification';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buyer-signup" element={<BuyerSignup />} />
            <Route path="/seller-signup" element={<SellerSignup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/products" element={<ProductListing />} /> 
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/seller/orders" element={<SellerOrders />} />
          </Routes>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
