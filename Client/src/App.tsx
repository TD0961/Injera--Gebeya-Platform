import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BuyerSignup from './pages/BuyerSignup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SellerSignup from './pages/SellerSignup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buyer-signup" element={<BuyerSignup />} />
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

export default App;