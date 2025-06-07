// src/components/layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, isCollapsed, onClose, items = [] }) => {
  const location = useLocation();

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`
          fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 
          transition-all duration-300 hidden lg:block
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        <nav className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item, index) => {
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center p-3 rounded-lg transition-colors group
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon 
                      className={`
                        w-5 h-5 transition-colors
                        ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-900'}
                      `} 
                    />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`
          fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
          transform transition-transform duration-300 lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {items.map((item, index) => {
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center p-3 rounded-lg transition-colors group
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon 
                      className={`
                        w-5 h-5 transition-colors
                        ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-900'}
                      `} 
                    />
                    <span className="ml-3 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;