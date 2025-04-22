// In a file like src/components/FeatureCards.jsx (or .tsx if using TypeScript)
import React from 'react';

const FeatureCard = ({ imageUrl, title, description, linkText, linkUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <a href={linkUrl} className="text-orange-500 hover:underline">{linkText}</a>
      </div>
    </div>
  );
};

const FeatureCards = () => {
  const features = [
    {
      imageUrl: 'https://i.ytimg.com/vi/P9TfgwRMWbE/sddefault.jpg', // Replace with your actual image path
      title: 'Connect with Local Sellers',
      description: 'Browse a variety of home-based and small-scale Injera producers in your area.',
      linkText: 'Find Sellers',
      linkUrl: '/sellers', // Replace with your actual link
    },
    {
      imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/lula-20201119-injera-hr-64f7722ec460e.jpg?crop=1.00xw:0.383xh;0,0.488xh&resize=1200:*', // Replace with your actual image path
      title: 'Sell Your Delicious Injera',
      description: 'Reach a wider customer base and grow your Injera business online.',
      linkText: 'Become a Seller',
      linkUrl: '/register-seller', // Replace with your actual link
    },
    {
      imageUrl: 'https://publish.eastleighvoice.co.ke/mugera_lock/uploads/2024/07/Injera-2.jpg', // Replace with your actual image path
      title: 'Order for Delivery or Pickup',
      description: 'Enjoy the convenience of having Injera delivered or picking it up locally.',
      linkText: 'Order Now',
      linkUrl: '/products', // Replace with your actual link
    },
  ];

  return (
    <div className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center mt-7">Explore Injera Gebeya</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;