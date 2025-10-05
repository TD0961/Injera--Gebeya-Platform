import { useState } from 'react';
import bgImg from '../assets/hero.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Add forgot password logic
    alert('Password reset link sent!');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-2"
      style={{
        backgroundImage: `url(${bgImg})`,
      }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Forgot Password</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter your email to reset your password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}