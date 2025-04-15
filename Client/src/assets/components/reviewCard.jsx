import React from 'react';

const ReviewCard = ({ user, time, imageUrl, title, rating, review }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-sm">
      {/* User Info */}
      <div className="flex items-center mb-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
      </div>

      {/* Image */}
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>

      {/* Rating */}
      <div className="flex items-center mb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`text-yellow-500 ${
              index < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Review */}
      <p className="text-gray-600 mb-4">{review}</p>

      {/* Actions */}
      <div className="flex justify-between items-center text-gray-500">
        <button className="flex items-center gap-1 hover:text-gray-800">
          <i className="fas fa-thumbs-up"></i> Like
        </button>
        <button className="flex items-center gap-1 hover:text-gray-800">
          <i className="fas fa-comment"></i> Comment
        </button>
        <button className="flex items-center gap-1 hover:text-gray-800">
          <i className="fas fa-share"></i> Share
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;