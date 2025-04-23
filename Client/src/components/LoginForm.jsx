import React, { useState } from "react";
import axios from "axios"; // Import Axios
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the backend
      const response = await axios.post("http://localhost:5000/api/users/forgot-password", {
        email,
      });

      // Handle success response
      toast.success(response.data.message || "Password reset email sent!");
      setEmail(""); // Clear the email field
    } catch (error) {
      // Handle error response
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium text-lg">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition duration-300 text-lg font-semibold"
        >
          Reset Password
        </button>
      </form>
      <ToastContainer /> {/* Add ToastContainer to render toasts */}
    </>
  );
}

export default ForgotPasswordForm;