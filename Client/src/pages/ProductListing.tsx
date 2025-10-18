import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingCart, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  // 🧭 Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        const savedStock = localStorage.getItem("productStock");
        const storedStock: Record<number, number> = savedStock ? JSON.parse(savedStock) : {};

        const updatedProducts = res.data.map((p: Product) => ({
          ...p,
          stock: storedStock[p.id] ?? p.stock,
        }));

        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // 💾 Persist cart and stock
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const stockMap = Object.fromEntries(products.map((p) => [p.id, p.stock]));
    localStorage.setItem("productStock", JSON.stringify(stockMap));
  }, [products]);

  // 🔍 Search filter
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // 🛒 Add to cart (with quantity)
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    updateStock(product.id, -1);
  };

  // ❌ Remove one from cart
  const removeOne = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
    updateStock(id, +1);
  };

  // ⚙️ Update stock
  const updateStock = (id: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + delta } : p))
    );
    setFilteredProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: p.stock + delta } : p))
    );
  };

  // 🧮 Total items count
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* HEADER */}
      <header className="bg-green-800/95 text-white shadow-md fixed top-0 left-0 w-full z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-3 gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-bold text-yellow-400 tracking-wide">eGebeya</h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search food..."
                className="pl-10 pr-4 py-2 rounded-full text-white placeholder-gray-300 bg-green-900/80 w-64 sm:w-72 focus:ring-2 focus:ring-yellow-400 outline-none"
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
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {totalQuantity}
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
          <p className="text-center text-gray-700 mt-10 bg-white/70 rounded-lg p-4 shadow-lg">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-lg rounded-2xl overflow-hidden w-72 border border-yellow-500/20 transform hover:scale-105 transition-all hover:shadow-yellow-500/30"
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
                  <h3 className="text-lg font-semibold text-green-800">{product.name}</h3>
                  <p className="text-yellow-600 font-bold mt-1">${product.price}</p>
                  <p className="text-gray-600 mt-1">Stock: {product.stock}</p>
                  {product.shop && (
                    <p className="text-gray-500 mt-1 text-sm">Shop: {product.shop}</p>
                  )}

                  {product.stock > 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-3 px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-semibold transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="mt-3 px-5 py-2 rounded-full bg-gray-300 text-gray-700 font-medium">
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
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50 backdrop-blur-sm">
          <div className="bg-white w-80 sm:w-96 h-full shadow-2xl flex flex-col text-green-900 rounded-l-2xl animate-slide-left overflow-hidden border-l border-yellow-500/30">
            <div className="flex justify-between items-center p-4 border-b border-yellow-500/30 bg-yellow-100">
              <h2 className="text-lg font-semibold text-green-800">🛒 Your Cart</h2>
              <X
                className="cursor-pointer text-green-800 hover:text-yellow-600"
                onClick={() => setCartOpen(false)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={`cart-${item.product.id}`}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-yellow-700 font-semibold">${item.product.price}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <button
                      className="text-sm text-red-500 hover:text-red-600"
                      onClick={() => removeOne(item.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-yellow-500/30 bg-yellow-50">
                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 py-2 rounded-full font-semibold transition">
                  Checkout
                </button>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/cart");
                  }}
                  className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-green-900 py-2 rounded-full font-semibold transition"
                >
                  Go to Cart Page
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
