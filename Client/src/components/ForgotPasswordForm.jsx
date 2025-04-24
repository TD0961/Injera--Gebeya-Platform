import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the backend
      const response = await axios.post("http://localhost:3000/api/users/forgot-password", {
        email,
      });

      // Show success toast if email exists
      toast.success(response.data.message || "Check your email for the password reset link!");
      setEmail(""); // Clear the email field
    } catch (error) {
      // Show error toast if email does not exist or other errors occur
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium text-lg">Email</label>
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
      <ToastContainer />
    </>
  );
}

export default ForgotPasswordForm;