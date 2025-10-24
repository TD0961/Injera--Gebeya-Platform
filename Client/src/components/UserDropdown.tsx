import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShoppingBag, Package, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface UserDropdownProps {
  className?: string;
}

export default function UserDropdown({ className = '' }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className={`w-9 h-9 bg-yellow-400 text-green-900 flex items-center justify-center rounded-full font-bold cursor-pointer hover:bg-yellow-500 transition ${className}`}
      >
        <User size={20} />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 px-3 py-2 rounded-full font-semibold transition-all duration-200 hover:shadow-lg"
      >
        <User size={18} />
        <span className="hidden sm:block text-sm">{user.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-slide-down">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  user.role === 'seller' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'seller' ? 'Seller' : 'Customer'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {user.role === 'buyer' ? (
              // Buyer Menu Items
              <>
                <button
                  onClick={() => handleNavigation('/products')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag size={16} />
                  Browse Products
                </button>
                <button
                  onClick={() => handleNavigation('/cart')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package size={16} />
                  My Cart
                </button>
                <button
                  onClick={() => handleNavigation('/orders')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package size={16} />
                  My Orders
                </button>
              </>
            ) : (
              // Seller Menu Items
              <>
                <button
                  onClick={() => handleNavigation('/seller/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('/seller/products')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package size={16} />
                  Manage Products
                </button>
                <button
                  onClick={() => handleNavigation('/seller/orders')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package size={16} />
                  Manage Orders
                </button>
              </>
            )}
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} />
              Profile Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
