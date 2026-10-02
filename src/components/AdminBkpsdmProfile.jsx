import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ArrowLeftRight, Check, Shield, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { logout, getUser, getUserRoles, getActiveRole, setActiveRole, canSwitchRole } from '../utils/auth';

const AdminBkpsdmProfile = ({ currentUser, onNavigate, variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = currentUser || getUser() || {};
  const userRoles = getUserRoles();
  const hasMultipleRoles = canSwitchRole();
  const currentActiveRole = getActiveRole() || 'admin_bkpsdm';

  const roleLabels = {
    admin_bkpsdm: { label: 'Admin BKPSDM', badge: 'bg-red-50 text-red-700 border-red-200' },
    admin_komunitas: { label: 'Admin Komunitas', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    peserta: { label: 'Peserta Pembelajaran', badge: 'bg-blue-50 text-blue-700 border-blue-200' }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (targetRole) => {
    if (targetRole === currentActiveRole) {
      setIsOpen(false);
      return;
    }

    if (!userRoles.includes(targetRole)) {
      alert('Akses Ditolak: Anda tidak diizinkan masuk ke peran ini.');
      return;
    }

    try {
      await api.post('/switch-role', { target_role: targetRole }).catch(() => {});
      setActiveRole(targetRole);
      setIsOpen(false);

      if (targetRole === 'admin_bkpsdm') {
        if (typeof onNavigate === 'function') {
          onNavigate('admin');
        } else {
          window.location.href = '/admin';
        }
      } else if (targetRole === 'admin_komunitas') {
        if (typeof onNavigate === 'function') {
          onNavigate('admin-komunitas');
        } else {
          window.location.href = '/admin-komunitas';
        }
      } else {
        if (typeof onNavigate === 'function') {
          onNavigate('dashboard');
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error('Gagal beralih peran:', err);
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout(() => {
      if (typeof onNavigate === 'function') onNavigate('landing');
      else window.location.href = '/';
    });
  };

  const avatarUrl = user?.foto_profil_url || user?.avatar || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nama_lengkap || 'Admin BKPSDM')}&background=DC2626&color=fff`;

  if (variant === 'header') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20 group cursor-pointer border border-gray-200 bg-white"
          title="Klik untuk melihat menu profil & beralih peran"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 border border-red-300 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-red-500 transition-colors">
            <img
              src={avatarUrl}
              alt="Admin BKPSDM"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight text-left">
            <span className="text-xs font-bold text-gray-800 truncate max-w-[120px] group-hover:text-red-700 transition-colors">
              {user?.nama_lengkap || 'BKPSDM'}
            </span>
            <span className="text-[10px] text-red-600 font-semibold">Super Admin</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : 'group-hover:text-gray-600'}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[70] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header Identitas */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.nama_lengkap || 'Admin BKPSDM'}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {user?.nip ? `NIP: ${user.nip}` : 'Super Admin Sistem'}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit ${roleLabels[currentActiveRole]?.badge || 'bg-red-50 text-red-700 border-red-200'}`}>
                  <Shield className="w-3 h-3" />
                  Peran Aktif: {roleLabels[currentActiveRole]?.label || currentActiveRole}
                </span>
                <span className="text-[11px] text-gray-500 truncate">
                  🏛️ BKPSDM Kab. Buleleng
                </span>
              </div>
            </div>

            {/* Opsi Beralih Peran */}
            {hasMultipleRoles ? (
              <div className="px-3 py-2 border-b border-gray-100 bg-red-50/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 mb-1.5 px-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-red-700" />
                  <span>Beralih Peran:</span>
                </div>
                <div className="space-y-1">
                  {userRoles.map((role) => {
                    const isActive = role === currentActiveRole;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSwitch(role)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'text-gray-700 hover:bg-white hover:text-red-800'
                        }`}
                      >
                        <span>{roleLabels[role]?.label || role}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-4 py-2 text-[11px] text-gray-400 italic border-b border-gray-100">
                Peran tunggal (Ditetapkan oleh Sistem)
              </div>
            )}

            {/* Menu Logout */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar Platform
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: variant === 'sidebar'
  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Tombol Profil Interaktif di Sidebar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-1.5 -m-1 rounded-xl hover:bg-gray-100/90 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-red-500/20 group cursor-pointer"
        title="Klik untuk melihat menu profil & beralih peran"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-red-100 border border-red-300 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-red-500 transition-colors shadow-xs">
            <img
              src={avatarUrl}
              alt="Admin BKPSDM"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-gray-900 text-xs sm:text-sm truncate w-24 group-hover:text-red-700 transition-colors">
              {user?.nama_lengkap || 'BKPSDM'}
            </h2>
            <p className="text-[11px] text-red-600 font-semibold truncate w-24">
              Super Admin
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-600' : 'group-hover:text-gray-600'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[70] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Identitas */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800 truncate">
              {user?.nama_lengkap || 'Admin BKPSDM'}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              {user?.nip ? `NIP: ${user.nip}` : 'Super Admin Sistem'}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit ${roleLabels[currentActiveRole]?.badge || 'bg-red-50 text-red-700 border-red-200'}`}>
                <Shield className="w-3 h-3" />
                Peran Aktif: {roleLabels[currentActiveRole]?.label || currentActiveRole}
              </span>
              <span className="text-[11px] text-gray-500 truncate">
                🏛️ BKPSDM Kab. Buleleng
              </span>
            </div>
          </div>

          {/* OPSI BERALIH PERAN */}
          {hasMultipleRoles ? (
            <div className="px-3 py-2 border-b border-gray-100 bg-red-50/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 mb-1.5 px-1">
                <ArrowLeftRight className="w-3.5 h-3.5 text-red-700" />
                <span>Beralih Peran:</span>
              </div>
              <div className="space-y-1">
                {userRoles.map((role) => {
                  const isActive = role === currentActiveRole;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'text-gray-700 hover:bg-white hover:text-red-800'
                      }`}
                    >
                      <span>{roleLabels[role]?.label || role}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 text-[11px] text-gray-400 italic border-b border-gray-100">
              Peran tunggal (Ditetapkan oleh Sistem)
            </div>
          )}

          {/* Menu Logout */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Keluar Platform
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBkpsdmProfile;
