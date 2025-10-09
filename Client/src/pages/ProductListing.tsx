import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingCart, User, X } from "lucide-react";
import Logo from "../assets/Logo";
import bg from "../assets/hero.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  shop?: string;
  category?: string;
  image_url?: string;
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Filter by search
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add to cart and decrement stock
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists ? prev : [...prev, product];
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    setFilteredProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* HEADER */}
      <header className="bg-green-800/95 text-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-3 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-bold text-yellow-400">eGebeya</h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search food..."
                className="pl-10 pr-4 py-2 rounded-full text-white placeholder-gray-300 bg-green-900 w-64 sm:w-72 focus:ring-2 focus:ring-yellow-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <div className="flex items-center gap-3">
              <div
                className="relative cursor-pointer"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="text-yellow-400 hover:text-yellow-500" size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {cart.length}
                  </span>
                )}
              </div>

              <div className="w-9 h-9 bg-yellow-400 text-green-900 flex items-center justify-center rounded-full font-bold cursor-pointer hover:bg-yellow-500 transition">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-[130px] sm:h-[110px]"></div>

      {/* PRODUCT GRID */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-700 mt-10 bg-white/80 rounded-lg p-4 shadow">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {filteredProducts.map((product, idx) => (
              <div
                key={`prod-${product.id || idx}`}
                className="bg-white/95 shadow-md rounded-2xl overflow-hidden w-72 transform hover:scale-105 transition-all"
              >
                <img
                  src={
                    product.image_url
                      ? product.image_url.startsWith("http")
                        ? product.image_url
                        : `http://localhost:3000/${product.image_url}`
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                  <p className="text-yellow-600 font-bold mt-1">${product.price}</p>
                  <p className="text-gray-700 mt-1">Stock: {product.stock}</p>
                  {product.shop && (
                    <p className="text-gray-500 mt-1 text-sm">Shop: {product.shop}</p>
                  )}

                  {/* Add to Cart or Sold Out */}
                  {product.stock > 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-3 px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="mt-3 px-5 py-2 rounded-full bg-gray-400 text-white">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-80 sm:w-96 h-full shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-green-800">Your Cart</h2>
              <X
                className="cursor-pointer text-gray-600 hover:text-red-500"
                onClick={() => setCartOpen(false)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
              ) : (
                cart.map((item, i) => (
                  <div key={`cart-${item.id || i}`} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-yellow-600">${item.price}</p>
                    </div>
                    <button
                      className="text-sm text-red-500 hover:underline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t">
                <button className="w-full bg-green-800 hover:bg-green-900 text-yellow-400 py-2 rounded-full font-semibold transition">
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
