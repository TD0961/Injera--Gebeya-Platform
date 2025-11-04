import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/seller/Sidebar";
import ProductTable from "../components/seller/ProductTable";
import ProductForm from "../components/seller/ProductForm";
import type { Product } from "../components/seller/ProductTable";
import bgImg from "../assets/hero.jpg";
import toast from "react-hot-toast";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { Eye } from "lucide-react";
import {
  getMyProducts,
  createProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "../api/Seller";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useUser();
  const [activeTab, setActiveTab] = useState<"products" | "add" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sellerName, setSellerName] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Only fetch if user is authenticated and is a seller
    if (user && user.role === 'seller') {
      fetchProducts(false); // Don't show error toast on initial load
      fetchSellerName();
    } else if (!user) {
      // If not authenticated, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  async function fetchSellerName() {
    try {
      const res = await axios.get("/api/me", {
        withCredentials: true,
      });
      setSellerName(res.data.name);
    } catch (err) {
      console.error("Failed to fetch seller name", err);
    }
  }

  async function fetchProducts(showError: boolean = false) {
    try {
      setLoading(true);
      const data = await getMyProducts();
      const mapped = data.map((p: any) => ({
        id: p.ID || p.id,
        name: p.name,
        price: Number(p.price),
        stock: p.stock || 0,
        image: p.image_url || "",
      })) as Product[];
      setProducts(mapped);
    } catch (err: any) {
      console.error("Could not fetch products", err);
      // Only show error toast if explicitly requested (e.g., manual refresh)
      // Don't show on initial page load
      if (showError) {
        const status = err.response?.status;
        if (status !== 401 && status !== 403) {
          toast.error("Failed to load products");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function addProduct(p: Omit<Product, "id">) {
    try {
      const payload = {
        name: p.name,
        price: p.price,
        description: "",
        image_url: p.image,
        stock: p.stock,
      };
      const created = await createProduct(payload);
      const newP: Product = {
        id: created.ID || created.id || Date.now(),
        name: created.name,
        price: Number(created.price),
        stock: created.stock,
        image: created.image_url,
      };
      setProducts((s) => [newP, ...s]);
      setActiveTab("products");
      toast.success("✅ Product added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add product");
    }
  }

  async function updateProduct(updated: Product) {
    try {
      toast.loading("Updating product...");
      const payload = {
        name: updated.name,
        price: updated.price,
        description: "",
        image_url: updated.image,
        stock: updated.stock,
      };
      await apiUpdateProduct(updated.id, payload);
      toast.dismiss();
      toast.success("✅ Product updated successfully!");
      await fetchProducts(false); // Silent refresh after update
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("❌ Failed to update product");
    }
  }

  async function deleteProduct(id: number) {
    try {
      toast.loading("Deleting product...");
      await apiDeleteProduct(id);
      toast.dismiss();
      toast.success("🗑️ Product deleted successfully!");
      await fetchProducts(false); // Silent refresh after delete
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("❌ Failed to delete product");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1 p-8">
            <header className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-semibold text-green-700">
                    Seller Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Welcome back, <span className="text-yellow-400 font-semibold">{sellerName || "Seller"}</span>!
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Product Listing Button */}
                  <button
                    onClick={() => navigate('/products')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Products
                  </button>
                  {/* Mobile logout button */}
                  <button
                    onClick={handleLogout}
                    className="md:hidden px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </header>

            <section className="space-y-8">
              {activeTab === "products" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Product List
                  </h2>
                  {loading ? (
                    <p className="text-gray-600 animate-pulse">
                      Loading products...
                    </p>
                  ) : (
                    <ProductTable
                      products={products}
                      onDelete={deleteProduct}
                      onUpdate={updateProduct}
                    />
                  )}
                </div>
              )}

              {activeTab === "add" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Add New Product
                  </h2>
                  <ProductForm onSubmit={addProduct} />
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Order Management
                  </h2>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600 mb-4">
                      Manage your incoming orders and track their status
                    </p>
                    <button
                      onClick={() => navigate('/seller/orders')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                    >
                      Go to Order Management
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
