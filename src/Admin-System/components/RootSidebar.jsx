import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  HardDrive, 
  LogOut, 
  X,
  ShieldAlert,
  Server
} from 'lucide-react';
import AdminBkpsdmProfile from '../../components/AdminBkpsdmProfile';
import { logout } from '../../utils/auth';

const RootSidebar = ({ currentRoute = 'admin-system', onNavigate, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    {
      id: 'admin-system',
      label: 'Dasbor Sistem',
      icon: LayoutDashboard,
    },
    {
      id: 'root-log-aktivitas',
      label: 'Log Aktivitas (Audit)',
      icon: Activity,
    },
    {
      id: 'root-backup-db',
      label: 'Backup Basis Data',
      icon: Database,
    },
    {
      id: 'root-e-file',
      label: 'Manajemen E-File',
      icon: HardDrive,
    },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Top Profile Bar (Identical to Admin BKPSDM) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <AdminBkpsdmProfile onNavigate={onNavigate} variant="sidebar" />
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)} 
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Section */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Infrastruktur Sistem
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (setIsOpen && window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-700 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-left truncate leading-tight flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">

          <button 
            onClick={() => {
              if (onNavigate) onNavigate('root-log-aktivitas');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
          >
            Audit Log Sistem
          </button>

          <button 
            onClick={() => {
              if (typeof onLogout === 'function') {
                onLogout();
              } else {
                logout(() => {
                  if (typeof onNavigate === 'function') {
                    onNavigate('portal');
                  } else {
                    window.location.href = '/';
                  }
                });
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default RootSidebar;
