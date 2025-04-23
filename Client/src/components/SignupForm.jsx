import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(""); // State for password strength

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength when the password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    // Basic password strength validation
    if (password.length < 6) {
      setPasswordStrength("Weak (minimum 6 characters)");
    } else if (!/[A-Z]/.test(password)) {
      setPasswordStrength("Medium (add an uppercase letter)");
    } else if (!/[0-9]/.test(password)) {
      setPasswordStrength("Medium (add a number)");
    } else if (!/[!@#$%^&*]/.test(password)) {
      setPasswordStrength("Strong (add a special character)");
    } else {
      setPasswordStrength("Very Strong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match"); // Show error toast
      return;
    }

    try {
      // Send POST request using Axios
      const response = await axios.post("http://localhost:5000/api/users/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Handle success response
      toast.success("Signup successful!"); // Show success toast
      console.log(response.data);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setPasswordStrength(""); // Reset password strength
    } catch (error) {
      // Handle error response
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again."); // Show error toast
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          {passwordStrength && (
            <p className={`mt-1 text-sm ${passwordStrength.includes("Weak") ? "text-red-500" : "text-green-500"}`}>
              {passwordStrength}
            </p>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300"
        >
          Signup
        </button>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </>
  );
}

export default SignupForm;