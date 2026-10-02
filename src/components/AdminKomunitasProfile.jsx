import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ArrowLeftRight, Check, Shield, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import userImg from '../assets/user.png';
import { logout, getUser, getUserRoles, getActiveRole, setActiveRole, canSwitchRole } from '../utils/auth';

const AdminKomunitasProfile = ({ currentUser, communityName, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = currentUser || getUser() || {};
  const userRoles = getUserRoles();
  const hasMultipleRoles = canSwitchRole();
  const currentActiveRole = getActiveRole() || 'admin_komunitas';

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Profil Interaktif */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-2 -m-2 rounded-xl hover:bg-gray-100/80 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 group cursor-pointer"
        title="Klik untuk melihat menu profil & beralih peran"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-teal-500 transition-colors">
            <img
              src={user?.foto_profil_url || user?.avatar || userImg}
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-gray-900 text-sm truncate w-32 group-hover:text-teal-700 transition-colors">
              {user?.nama_lengkap || 'Admin Komunitas'}
            </h2>
            <p className="text-xs text-gray-500 truncate w-32">
              {communityName || 'Komunitas TI'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-teal-600' : 'group-hover:text-gray-600'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[70] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Identitas */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800 truncate">
              {user?.nama_lengkap || 'Admin Komunitas'}
            </p>
            <p className="text-xs text-gray-500 font-mono">
              NIP: {user?.nip || '-'}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit ${roleLabels[currentActiveRole]?.badge || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                <Shield className="w-3 h-3" />
                Peran: {roleLabels[currentActiveRole]?.label || currentActiveRole}
              </span>
              {communityName && (
                <span className="text-[11px] text-gray-500 truncate">
                  🏢 {communityName}
                </span>
              )}
            </div>
          </div>

          {/* OPSI BERALIH PERAN: HANYA MUNCUL JIKA USER MEMILIKI > 1 ROLE DARI ADMIN-BKPSDM */}
          {hasMultipleRoles ? (
            <div className="px-3 py-2 border-b border-gray-100 bg-teal-50/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-1.5 px-1">
                <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
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
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-gray-700 hover:bg-white hover:text-teal-800'
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
              Peran tunggal (Ditetapkan oleh Admin-BKPSDM)
            </div>
          )}

          {/* Menu Logout */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout(() => {
                  if (typeof onNavigate === 'function') onNavigate('landing');
                  else window.location.href = '/';
                });
              }}
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

export default AdminKomunitasProfile;
