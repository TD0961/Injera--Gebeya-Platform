import { useState } from "react";
import Sidebar from "../components/seller/Sidebar";
import ProductTable from "../components/seller/ProductTable";
import ProductForm from "../components/seller/ProductForm";
import type { Product } from "../components/seller/ProductTable";
import bgImg from "../assets/hero.jpg";


export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "add">("products");
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Injera Combo", price: 150, stock: 10, image: "" },
    { id: 2, name: "Tibs Special", price: 220, stock: 5, image: "" },
  ]);

  function addProduct(p: Omit<Product, "id">) {
    setProducts((s) => [{ id: Date.now(), ...p }, ...s]);
    setActiveTab("products"); 
  }

  function deleteProduct(id: number) {
    setProducts((s) => s.filter((x) => x.id !== id));
  }

  function updateProduct(updated: Product) {
    setProducts((s) => s.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImg})` }}

    >
      {/* Centered card */}
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content */}
          <div className="flex-1 p-8">
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-green-700">Seller Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Seller!</p>
            </header>

            <section className="space-y-8">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Product List</h2>
                <ProductTable
                  products={products}
                  onDelete={deleteProduct}
                  onUpdate={updateProduct}
                />
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h2>
                <ProductForm onSubmit={addProduct} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
