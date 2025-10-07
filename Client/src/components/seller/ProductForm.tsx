import { useState } from "react";
import type{ Product } from "./ProductTable";

type Props = {
  onSubmit: (p: Omit<Product, "id">) => void;
};

export default function ProductForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    setLoading(true);
    onSubmit({
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image,
    });
    setForm({ name: "", price: "", stock: "", image: "" });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="p-3 border rounded-lg"
          required
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="p-3 border rounded-lg"
          type="number"
          required
        />
        <input
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="p-3 border rounded-lg"
          type="number"
          required
        />
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Image URL (optional)"
          className="p-3 border rounded-lg"
        />
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Adding…" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
