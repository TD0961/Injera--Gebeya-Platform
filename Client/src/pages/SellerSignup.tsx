import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import bgImg from '../assets/hero.jpg';

export default function SellerSignup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!', { position: 'top-center' });
      return;
    }

    setLoading(true);

    try {
      // ✅ Use relative URL for Vite proxy
      const response = await axios.post('/api/register', {
        ...form,
        role: 'seller',
      });

      // Check if email verification is required
      if (response.data.requiresVerification) {
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', form.email);
        
        setSuccess(true);
        toast.success('Registration successful! Please check your email to verify your account.', { 
          position: 'top-center',
          duration: 5000
        });

        // Redirect to email verification page
        navigate('/verify-email');
        return;
      }

      setSuccess(true);
      toast.success('Registration successful! Redirecting to login...', { position: 'top-center' });

      // Clear inputs
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        address: '',
      });

      // Redirect after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed!';
      toast.error(message, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
    toast('Google signup coming soon!', { position: 'top-center' });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-2"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <Toaster />
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Become a Seller</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Register your shop and start selling Ethiopian meals.
        </p>

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="text"
              name="shopName"
              placeholder="Shop Name"
              value={form.shopName}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="text"
              name="address"
              placeholder="Shop Address"
              value={form.address}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        )}

        <button
          onClick={handleGoogleSignup}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg transition-all"
        >
          Continue with Google
        </button>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
