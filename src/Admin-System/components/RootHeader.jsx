import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import AdminBkpsdmProfile from '../../components/AdminBkpsdmProfile';

const RootHeader = ({ currentRoute, onRefresh, isRefreshing, onNavigate, setIsOpen }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          type="button"
          onClick={() => setIsOpen && setIsOpen(true)} 
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Refresh button & AdminBkpsdmProfile */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Segarkan Data"
            className="p-2 text-gray-500 hover:text-teal-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        )}

        {/* Profile Dropdown */}
        <AdminBkpsdmProfile onNavigate={onNavigate} variant="header" />
      </div>
    </header>
  );
};

export default RootHeader;
