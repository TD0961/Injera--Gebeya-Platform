import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";

function ResetPasswordPage() {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSuccess = () => {
    // Redirect to the login page after a successful password reset
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Reset Your Password</h2>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export default ResetPasswordPage;