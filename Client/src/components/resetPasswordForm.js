import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPasswordForm({ match }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/users/reset-password/${match.params.token}`, {
        password,
      });

      toast.success(response.data.message || "Password reset successful!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium text-lg">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 text-lg"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium text-lg">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
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

export default ResetPasswordForm;