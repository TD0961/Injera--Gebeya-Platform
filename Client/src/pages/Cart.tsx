import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus } from "lucide-react";
import bg from "../assets/hero.jpg";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type Product = {
  id: number;
  stock: number;
};

const CART_KEY = "cart";
const STOCK_KEY = "productStock";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) as CartItem[] : [];
  });
  const [stockMap, setStockMap] = useState<Record<number, number>>(() => {
    const s = localStorage.getItem(STOCK_KEY);
    return s ? JSON.parse(s) : {};
  });

  const navigate = useNavigate();

  // Sync to localStorage on cart change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Sync to localStorage on stock map change
  useEffect(() => {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockMap));
  }, [stockMap]);

  // storage event to sync across tabs/pages
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === CART_KEY) {
        const s = localStorage.getItem(CART_KEY);
        setCart(s ? JSON.parse(s) : []);
      }
      if (e.key === STOCK_KEY) {
        const s = localStorage.getItem(STOCK_KEY);
        setStockMap(s ? JSON.parse(s) : {});
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helpers
  const saveCart = (next: CartItem[]) => {
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const saveStock = (nextMap: Record<number, number>) => {
    setStockMap(nextMap);
    localStorage.setItem(STOCK_KEY, JSON.stringify(nextMap));
  };

  // Increase quantity for a cart item (respect stock)
  const increaseQuantity = (item: CartItem) => {
    const available = (stockMap[item.id] ?? 0);
    if (available <= 0) {
      alert(`No more stock available for ${item.name}`);
      return;
    }
    const next = cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    saveCart(next);
    saveStock({ ...stockMap, [item.id]: (stockMap[item.id] ?? 0) - 1 });
  };

  // Decrease quantity (remove if 0)
  const decreaseQuantity = (item: CartItem) => {
    if (item.quantity <= 1) {
      // remove & restore stock by 1
      const next = cart.filter((c) => c.id !== item.id);
      saveCart(next);
      saveStock({ ...stockMap, [item.id]: (stockMap[item.id] ?? 0) + 1 });
    } else {
      const next = cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
      saveCart(next);
      saveStock({ ...stockMap, [item.id]: (stockMap[item.id] ?? 0) + 1 });
    }
  };

  // Remove whole item (restore stock by qty)
  const removeItem = (item: CartItem) => {
    const next = cart.filter((c) => c.id !== item.id);
    saveCart(next);
    saveStock({ ...stockMap, [item.id]: (stockMap[item.id] ?? 0) + item.quantity });
  };

  const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white p-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-300 mb-6">🛒 Your Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-green-900/80 rounded-lg p-8 text-center text-yellow-200">
            <p className="text-lg">Your cart is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 rounded-full font-semibold"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-green-800/70 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-md object-cover" />}
                    <div>
                      <h3 className="font-semibold text-yellow-100">{item.name}</h3>
                      <p className="text-yellow-400 font-semibold">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-300">Available: {(stockMap[item.id] ?? 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item)}
                      className="p-2 rounded-full bg-green-900/70 hover:bg-green-900/90"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus size={16} className="text-yellow-200"/>
                    </button>

                    <div className="px-3 text-yellow-100 font-semibold">{item.quantity}</div>

                    <button
                      onClick={() => increaseQuantity(item)}
                      className="p-2 rounded-full bg-green-900/70 hover:bg-green-900/90"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus size={16} className="text-yellow-200"/>
                    </button>

                    <button
                      onClick={() => removeItem(item)}
                      className="ml-4 text-sm text-red-300 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-900/80 rounded-lg flex justify-between items-center">
              <div className="text-yellow-200 font-medium">Total</div>
              <div className="text-yellow-300 text-xl font-bold">${total.toFixed(2)}</div>
            </div>

            <button
              onClick={() => alert("Payment flow not implemented")}
              disabled={cart.length === 0}
              className={`mt-6 w-full py-3 rounded-full font-bold transition ${
                cart.length === 0
                  ? "bg-yellow-300 text-green-900 opacity-70 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-green-900"
              }`}
            >
              Pay Now
            </button>

            <button
              onClick={() => navigate("/products")}
              className="mt-4 w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-green-900 rounded-full font-semibold"
            >
              Continue Shopping
            </button>
          </>
        )}
      </div>
    </div>
  );
}
