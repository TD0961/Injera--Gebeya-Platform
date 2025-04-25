import React from "react";
import { Link } from "react-router-dom";

function Sidebar({ closeSidebar }) {
  return (
    <div className="h-full p-6 bg-white shadow-lg">
      {/* Close Button */}
      <button
        className="text-gray-700 hover:text-orange-500 mb-6 focus:outline-none"
        onClick={closeSidebar}
      >
        <i className="fas fa-times text-2xl"></i> {/* Close Icon */}
      </button>

      {/* Sidebar Title */}
      <h2 className="text-2xl font-bold text-orange-500 mb-6">Injera Gebeya</h2>

      {/* Navigation Links */}
      <nav className="space-y-4">
        <Link
          to="/dashboard"
          className="block text-gray-700 hover:text-orange-500 font-medium transition duration-300"
        >
          Dashboard
        </Link>
        <Link
          to="/orders"
          className="block text-gray-700 hover:text-orange-500 font-medium transition duration-300"
        >
          Orders
        </Link>
        <Link
          to="/profile"
          className="block text-gray-700 hover:text-orange-500 font-medium transition duration-300"
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="block text-gray-700 hover:text-orange-500 font-medium transition duration-300"
        >
          Settings
        </Link>
        <Link
          to="/logout"
          className="block text-red-500 hover:text-red-700 font-medium transition duration-300"
        >
          Logout
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;