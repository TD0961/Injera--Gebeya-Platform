import React from "react";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Profile</h2>
      {user ? (
        <div>
          <p className="text-gray-600">Name: {user.name}</p>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>
      ) : (
        <p className="text-gray-600">No user data available.</p>
      )}
    </div>
  );
}

export default UserProfile;