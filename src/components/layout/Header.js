// src/components/layout/Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Mail,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar, sidebarCollapsed, onToggleCollapse }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const handleSettings = () => {
    const settingsPath = isAdmin() ? '/admin/settings' : '/settings';
    navigate(settingsPath);
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-30">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="w-5 h-5" />
              ) : (
                <ChevronsLeft className="w-5 h-5" />
              )}
            </button>

            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Sistem Surat Tugas
                </h1>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.nim} • {isAdmin() ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-40">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.nim}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Pengaturan
                  </button>
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;