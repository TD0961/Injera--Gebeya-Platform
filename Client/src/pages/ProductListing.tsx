import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingCart, Filter, Star, Heart, Eye, Plus, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Logo";
import UserDropdown from "../components/UserDropdown";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";
import bg from "../assets/hero.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  shop?: string;
  category?: string;
  image_url?: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isOnSale?: boolean;
}

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalStock, setOriginalStock] = useState<Record<number, number>>({});
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, getTotalItems, getCartItemQuantity, ensurePaymentDeadline } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // Get message from navigation state
  const message = location.state?.message;

  // 🧭 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/products");
        const updatedProducts: Product[] = res.data.map((p: any) => ({
          id: p.ID || p.id, // Fix: Use ID (uppercase) first, fallback to id
          name: p.name,
          price: Number(p.price),
          originalPrice: Number(p.price) * 1.2, // Mock original price for sale effect
          stock: Number(p.stock ?? 0),
          shop: p.shop,
          category: p.category || 'food',
          image_url: p.image_url,
          rating: Math.random() * 2 + 3, // Mock rating 3-5
          reviewCount: Math.floor(Math.random() * 50) + 5, // Mock review count
          isNew: Math.random() > 0.7, // 30% chance of being new
          isOnSale: Math.random() > 0.6, // 40% chance of being on sale
        }));

        // Apply immediate visual deduction based on current cart contents
        const stockMap: Record<number, number> = {};
        const adjusted = updatedProducts.map((prod) => {
          const base = prod.stock;
          stockMap[prod.id] = base;
          const inCart = getCartItemQuantity(prod.id);
          return { ...prod, stock: Math.max(0, base - inCart) };
        });

        setOriginalStock(stockMap);
        setProducts(adjusted);
        setFilteredProducts(adjusted);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    // include getCartItemQuantity so first render reflects cart stock
  }, [getCartItemQuantity]);

  // 🔄 Calculate available stock based on cart quantities
  useEffect(() => {
    if (products.length === 0) return;
    const next = products.map((product) => {
      const inCart = getCartItemQuantity(product.id);
      const base = originalStock[product.id] ?? product.stock + inCart; // reconstruct base if not set
      return { ...product, stock: Math.max(0, base - inCart) };
    });
    setProducts(next);
  }, [cart, products.length, getCartItemQuantity]);

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

  // 🔍 Search and filter
  useEffect(() => {
    let filtered = products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return b.id - a.id; // Assuming higher ID = newer
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory, priceRange, sortBy]);

  // 🛒 Add to cart (with quantity)
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    // Start payment deadline once when first item is added in this session
    ensurePaymentDeadline();
    // Stock will be updated automatically by the cart sync effect
  };

  // 🧮 Total items count
  const totalQuantity = getTotalItems();

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

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

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Message for sellers */}
        {message && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Access Restricted</h3>
                <p className="text-sm text-yellow-700 mt-1">{message}</p>
                {user?.role === 'seller' && (
                  <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                  >
                    Go to Seller Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Filters and Sort Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              <div className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : (cat || '').charAt(0).toUpperCase() + (cat || '').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/70 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 1000]);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                <img
                  src={
                    product.image_url
                      ? product.image_url.startsWith("http")
                        ? product.image_url
                        : `http://localhost:3000/${product.image_url}`
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Product Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        NEW
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Stock Status */}
                  <div className="absolute bottom-2 left-2">
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  {product.shop && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.shop}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-600">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.isOnSale && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  <div className="text-sm text-gray-600 mb-3">
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock ({product.stock} available)</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  {product.stock > 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      Sold Out
                    </button>
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
