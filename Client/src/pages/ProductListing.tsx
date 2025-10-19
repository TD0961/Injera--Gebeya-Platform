import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo";
import UserDropdown from "../components/UserDropdown";
import { useCart } from "../contexts/CartContext";
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
  const [originalStock, setOriginalStock] = useState<Record<number, number>>({});
  const { cart, addToCart, getTotalItems, getCartItemQuantity } = useCart();
  const navigate = useNavigate();

  // 🧭 Fetch products
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        const updatedProducts = res.data.map((p: Product) => ({
          ...p,
          stock: p.stock || 0,
        }));

        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        
        // Store original stock values
        const stockMap: Record<number, number> = {};
        updatedProducts.forEach((product: Product) => {
          stockMap[product.id] = product.stock;
        });
        setOriginalStock(stockMap);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // 🔄 Calculate available stock based on cart quantities
  useEffect(() => {
    if (Object.keys(originalStock).length === 0) return; // Wait for original stock to be loaded
    
    setProducts((prev) =>
      prev.map((product) => {
        const cartQuantity = getCartItemQuantity(product.id);
        const availableStock = Math.max(0, originalStock[product.id] - cartQuantity);
        return {
          ...product,
          stock: availableStock,
        };
      })
    );
  }, [cart, originalStock, getCartItemQuantity]);

  // 🔄 Reset stock to original when cart is empty (timer expiration)
  useEffect(() => {
    if (cart.length === 0 && Object.keys(originalStock).length > 0) {
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          stock: originalStock[product.id] || product.stock,
        }))
      );
    }
  }, [cart.length, originalStock]);

  // 🔍 Search filter
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // 🛒 Add to cart (with quantity)
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    // Stock will be updated automatically by the cart sync effect
  };

  // 🧮 Total items count
  const totalQuantity = getTotalItems();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* HEADER */}
      <header className="bg-green-800/95 text-white shadow-md fixed top-0 left-0 w-full z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-2 sm:py-3 gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-bold text-yellow-400 tracking-wide">eGebeya</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search food..."
                className="pl-10 pr-4 py-2 rounded-full text-white placeholder-gray-300 bg-green-900/80 w-56 sm:w-72 focus:ring-2 focus:ring-yellow-400 outline-none text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="text-yellow-400 hover:text-yellow-500" size={24} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {totalQuantity}
                  </span>
                )}
              </div>

              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer - Increased mobile height to account for stacked header */}
      <div className="h-[160px] sm:h-[110px]"></div>

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
                  <p className="text-yellow-600 font-bold mt-1">${product.price.toFixed(2)}</p>
                  <p className="text-gray-600 mt-1">Stock: {product.stock}</p>
                  {product.shop && (
                    <p className="text-gray-500 mt-1 text-sm">Shop: {product.shop}</p>
                  )}

                  {product.stock > 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
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

    </div>
  );
}
