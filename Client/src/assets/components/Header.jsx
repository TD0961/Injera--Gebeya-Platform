import React from 'react';
import { Menu, ShoppingCart, User } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-amber-800">Home</a>
            <a href="#products" className="text-gray-700 hover:text-amber-800">Products</a>
            <a href="#sellers" className="text-gray-700 hover:text-amber-800">Sellers</a>
            <a href="#blog" className="text-gray-700 hover:text-amber-800">Blog</a>
            <a href="#contact" className="text-gray-700 hover:text-amber-800">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User className="h-6 w-6 text-gray-700" />
            </button>
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Header;