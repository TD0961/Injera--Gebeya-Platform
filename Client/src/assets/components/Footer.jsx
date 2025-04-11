import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Globe } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-[#0D0F29] text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Description */}
        <div className="mb-12">
          <Logo textClassName="text-amber-600" />
          <p className="text-gray-400 max-w-xl mt-4">
            Your premier marketplace for authentic Ethiopian cuisine, connecting local sellers with food enthusiasts worldwide.
          </p>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Browse Products</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Featured Items</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Best Sellers</a></li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Sellers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Become a Seller</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Seller Guidelines</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Seller Dashboard</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-amber-500 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-amber-500 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Injera Gebeya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;