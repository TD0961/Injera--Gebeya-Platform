import React from "react";
import SignupForm from "../components/UserSignupForm";

function SignupPage() {
return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">
                Signup
            </h1>
            <SignupForm />
        </div>
    </div>
);
}

export default SignupPage;