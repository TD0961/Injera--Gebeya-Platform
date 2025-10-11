import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  expiresAt: string;
  status: "pending" | "shipped" | "canceled";
};

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [timers, setTimers] = useState<{ [key: number]: number }>({});
  const navigate = useNavigate();

  // Load cart items safely from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        // ensure statuses are valid values
        const validated = parsed.map((item) => ({
          ...item,
          status:
            item.status === "pending" ||
            item.status === "shipped" ||
            item.status === "canceled"
              ? item.status
              : "pending",
        }));
        setCart(validated);
      } catch (e) {
        console.error("Invalid cart data", e);
      }
    }
  }, []);

  // Countdown timer for each cart item
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(() => {
        const updated: { [key: number]: number } = {};
        cart.forEach((item) => {
          const remaining =
            new Date(item.expiresAt).getTime() - new Date().getTime();
          updated[item.id] = Math.max(0, Math.floor(remaining / 1000));
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cart]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Payment handler
  function handlePay(item: CartItem) {
    const updated = cart.map((p) =>
      p.id === item.id ? { ...p, status: "shipped" as const } : p
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    alert(`✅ Payment successful for ${item.name}`);
  }

  // Cancel order handler
  function handleCancel(item: CartItem) {
    const updated = cart
      .map((p) =>
        p.id === item.id ? { ...p, status: "canceled" as const } : p
      )
      .filter((p) => p.status !== "canceled");
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    alert(`❌ ${item.name} canceled and returned to stock`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500">
          No items in cart.{" "}
          <button
            onClick={() => navigate("/products")}
            className="text-yellow-600 underline"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between bg-white shadow-md rounded-lg p-4 border-l-4 ${
                item.status === "pending"
                  ? "border-yellow-400"
                  : item.status === "shipped"
                  ? "border-green-400"
                  : "border-gray-400"
              }`}
            >
              <div className="flex items-center gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                )}
                <div>
                  <h2 className="font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × ${item.price} ={" "}
                    <span className="font-medium text-black">
                      ${item.price * item.quantity}
                    </span>
                  </p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      item.status === "pending"
                        ? "text-yellow-600"
                        : item.status === "shipped"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Status: {item.status.toUpperCase()}
                  </p>
                  {item.status === "pending" && (
                    <p className="text-sm text-gray-400">
                      Time left: {formatTime(timers[item.id] || 0)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {item.status === "pending" && timers[item.id] > 0 && (
                  <>
                    <button
                      onClick={() => handlePay(item)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleCancel(item)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {timers[item.id] <= 0 && item.status === "pending" && (
                  <span className="text-red-500 text-sm font-semibold">
                    Expired
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
