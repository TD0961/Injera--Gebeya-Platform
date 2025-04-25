import React from "react";

function Header() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      {/* Centered Welcome Text */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg sm:text-xl font-bold text-gray-700">
          {user ? `Welcome, ${user.name}` : "Welcome"}
        </h1>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center space-x-4">
        {user && user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;