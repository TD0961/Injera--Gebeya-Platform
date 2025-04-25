import React, { useState } from "react";
import Sidebar from "../components/UserDashboardSidebar";
import Header from "../components/UserDashboardHeader";
import DashboardContent from "../components/UserDashboardContents";

function UserDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Hamburger Icon */}
      <button
        className="p-4 fixed top-4 left-4 z-50 bg-white shadow-md rounded-full focus:outline-none hover:bg-gray-100"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="space-y-1">
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${
              isSidebarOpen ? "rotate-45 translate-y-1.5 bg-orange-500" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-gray-700 transition-transform duration-300 ${
              isSidebarOpen ? "-rotate-45 -translate-y-1.5 bg-orange-500" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 bg-white shadow-lg w-64`}
      >
        <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-gray-100 mt-6">
          <DashboardContent />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center py-4 shadow-md">
          <p className="text-gray-500 text-sm">
            © 2025 Injera Gebeya. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default UserDashboardPage;