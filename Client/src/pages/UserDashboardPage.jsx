import React from "react";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      {user && user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="w-16 h-16 rounded-full mr-4"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Profile</h2>
        {user ? (
          <div>
            <p className="text-gray-600">Name: {user.name}</p>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>
        ) : (
          <p className="text-gray-600">No user data available.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;