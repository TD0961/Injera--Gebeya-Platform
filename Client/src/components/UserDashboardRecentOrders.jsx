import React from "react";

function RecentOrders() {
  const orders = [
    { id: 1, item: "Injera Pack", date: "2025-04-20", status: "Shipped" },
    { id: 2, item: "Berbere Spice", date: "2025-04-18", status: "Delivered" },
    { id: 3, item: "Teff Flour", date: "2025-04-15", status: "Processing" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Recent Orders</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Item</th>
            <th className="border-b p-2">Date</th>
            <th className="border-b p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border-b p-2">{order.item}</td>
              <td className="border-b p-2">{order.date}</td>
              <td className="border-b p-2">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentOrders;