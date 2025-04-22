import React from "react";
import LoginForm from "../components/LoginForm";

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Adjusted container size */}
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
          Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;