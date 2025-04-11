import React from 'react';
import { ArrowRight } from 'lucide-react';

const Body = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://petitworldcitizen.com/wp-content/uploads/2015/01/img_00081.jpg?w=1566")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Authentic Ethiopian Cuisine
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Connect with local sellers and experience the rich flavors of traditional Injera. 
            Fresh, authentic, and delivered to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-semibold flex items-center justify-center gap-2 transition-all">
              Shop Now
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="px-8 py-3 bg-white hover:bg-gray-100 text-amber-800 rounded-full font-semibold">
              Become a Seller
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Body;