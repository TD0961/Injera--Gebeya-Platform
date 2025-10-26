import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { Eye } from "lucide-react";

interface Props {
  activeTab: "products" | "add" | "orders";
  setActiveTab: React.Dispatch<React.SetStateAction<"products" | "add" | "orders">>;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-full md:w-72 bg-white border-r hidden md:block">
      <div className="p-8">
        <div className="text-2xl font-bold text-green-700 mb-8">eGebeya</div>

        <nav className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
              activeTab === "products"
                ? "bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            My Products
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
              activeTab === "add"
                ? "bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Add Product
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
              activeTab === "orders"
                ? "bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Manage Orders
          </button>

          <button
            onClick={() => navigate('/products')}
            className="text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 text-gray-700 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            View All Products
          </button>
        </nav>

        <div className="mt-auto p-4 border-t">
            <button 
              onClick={handleLogout}
              className="w-full py-2 px-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all"
            >
                Logout
            </button>
        </div>

      </div>
    </aside>
  );
}
