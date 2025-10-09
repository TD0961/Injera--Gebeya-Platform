import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import bgImg from "../assets/hero.jpg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ✅ handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/login", form, {
        withCredentials: true,
      });

      toast.success("Login successful!", { position: "top-center" });

      const role = res.data.user?.role;
      setTimeout(() => {
        if (role === "seller") {
          navigate("/seller/dashboard");
        } else {
          navigate("/products"); // ✅ Redirect buyer here
        }
      }, 1000);

    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Login failed!";
      toast.error(message, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    toast("Google login coming soon!", { position: "top-center" });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <Toaster />
      <div className="bg-white bg-opacity-85 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-extrabold text-green-800 mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Log in to continue ordering or selling meals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Password</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <Link
              to="/forgot-password"
              className="text-yellow-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="flex items-center gap-2 my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12
                c2.6 0 5 .8 7 2.3l6.4-6.4C33.5 5.1 28.1 3 24 3C12.9 3 4 11.9 4 23s8.9 20 20 20c11 0
                19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"
              />
            </g>
          </svg>
          Continue with Google
        </button>

        <p className="text-center mt-5 text-sm text-gray-600">
          New to <span className="font-semibold text-green-700">eGebeya</span>?{" "}
          <Link
            to="/buyer-signup"
            className="text-yellow-600 hover:underline font-semibold"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
