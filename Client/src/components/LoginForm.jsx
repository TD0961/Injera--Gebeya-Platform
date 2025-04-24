import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import axios from "axios"; // Import Axios
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the backend
      const response = await axios.post("http://localhost:3000/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      // Handle success response
      toast.success("Login successful! Redirecting...");
      console.log(response.data);

      // Optionally, save the token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to the dashboard or home page
      setTimeout(() => {
        navigate("/dashboard"); // Adjust the route as needed
      }, 2000);
    } catch (error) {
      // Handle error response
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Invalid email or password");
    }
  }; 

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium text-lg">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-lg"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium text-lg">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition duration-300 text-lg font-semibold"
        >
          Login
        </button>
        <p className="text-center text-gray-600 mt-4">
          <Link to="/forgot-password" className="text-orange-500 hover:underline">
            Forgot your password?
          </Link>
        </p>
      </form>
      <ToastContainer /> {/* Add ToastContainer to render toasts */}
    </>
  );
}

export default LoginForm;