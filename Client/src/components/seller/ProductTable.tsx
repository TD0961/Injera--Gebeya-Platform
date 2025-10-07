import { useState } from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
};

type Props = {
  products: Product[];
  onDelete: (id: number) => void;
  onUpdate: (p: Product) => void;
};

export default function ProductTable({ products, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });

  function startEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function saveEdit() {
    if (!editing) return;
    const updated: Product = {
      ...editing,
      name: form.name || editing.name,
      price: Number(form.price || editing.price),
      stock: Number(form.stock || editing.stock),
    };
    onUpdate(updated);
    setEditing(null);
  }

  return (
    <div className="bg-white rounded-xl shadow-inner p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price} Birr</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-1 rounded-md bg-yellow-50 text-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="px-3 py-1 rounded-md bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline edit box */}
      {editing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md flex flex-col md:flex-row gap-3 items-start">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="p-2 border rounded-md"
              placeholder="Name"
            />
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="p-2 border rounded-md"
              placeholder="Price"
              type="number"
            />
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="p-2 border rounded-md"
              placeholder="Stock"
              type="number"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={saveEdit} className="px-4 py-2 bg-yellow-400 rounded-md text-white">
              Save
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-200 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
