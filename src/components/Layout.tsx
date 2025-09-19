import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage = 'dashboard', onPageChange }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bills', label: 'Bills', icon: '📄' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  // Security warning when user tries to close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = 'You will be automatically logged out for security. Are you sure you want to leave?';
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">Timez</h1>
                <p className="text-xs text-gray-500">Utility Tracker</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange?.(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <NotificationDropdown 
                onBillClick={(billId) => {
                  onPageChange?.('bills');
                  // You could add additional logic here to highlight the specific bill
                }}
              />
              
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                  <span className="text-xs text-gray-500">User</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange?.(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;