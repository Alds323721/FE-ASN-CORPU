import React, { useState } from 'react';
import RootSidebar from './RootSidebar';
import RootHeader from './RootHeader';

const RootLayout = ({ currentRoute, onNavigate, onLogout, onRefresh, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-gray-800">
      <RootSidebar 
        currentRoute={currentRoute} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <RootHeader 
          currentRoute={currentRoute} 
          onRefresh={onRefresh} 
          onNavigate={onNavigate}
          setIsOpen={setIsOpen} 
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
