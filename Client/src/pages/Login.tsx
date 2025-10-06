import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import bgImg from '../assets/hero.jpg';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Use relative URL to work with Vite proxy
      const res = await axios.post('/api/login', form, { withCredentials: true });

      toast.success('Login successful!', { position: 'top-center' });

      // ✅ Redirect based on role
      const role = res.data.user?.role;
      setTimeout(() => {
        if (role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login failed!';
      toast.error(message, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    toast('Google login coming soon!', { position: 'top-center' });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-2"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <Toaster />
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Login</h2>
        <p className="text-gray-500 mb-6 text-sm">Log in to continue ordering or selling meals.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-between items-center">
            <div />
            <Link to="/forgot-password" className="text-xs text-yellow-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12
                c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3C12.9 3 4 11.9 4 23s8.9 20 20 20c11 0
                19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.6 0 5 .8 7
                2.3l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"
              />
              <path
                fill="#FBBC05"
                d="M24 44c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.9 35.2 27.1
                36 24 36c-5.7 0-10.6-3.7-12.3-8.8l-7 5.4C7.8 41.1 15.2 44 24 44z"
              />
              <path
                fill="#EA4335"
                d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7
                5.5-4.6 0-8.3-3.7-8.3-8.3s3.7-8.3 8.3-8.3c2.6 0 5
                .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.2 0-13.3
                4.1-16.7 10.1z"
              />
            </g>
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-4 text-sm text-gray-600">
          New to eGebeya?{' '}
          <Link to="/buyer-signup" className="text-yellow-500 hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
