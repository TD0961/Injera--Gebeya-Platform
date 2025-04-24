import React from "react";

function Notifications() {
  const notifications = [
    "Your order #1234 has been shipped.",
    "Your profile was updated successfully.",
    "You have a new message from support.",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Notifications</h2>
      <ul className="list-disc pl-5 text-gray-600">
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
}

export default Notifications;