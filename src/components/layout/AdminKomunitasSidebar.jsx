import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import AdminKomunitasProfile from '../AdminKomunitasProfile';
import {
  LayoutDashboard,
  GraduationCap,
  BarChart2,
  Book,
  HelpCircle,
  HeadphonesIcon,
  LogOut
} from 'lucide-react';

const AdminKomunitasSidebar = ({ activeMenu = 'admin-komunitas', onNavigate, isOpen, setIsOpen }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [communityName, setCommunityName] = useState('Dinas Kesehatan');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
      }
      api.get('/admin-komunitas/komunitas-saya').then(res => {
        if (res.data?.data?.length > 0) {
          const own = res.data.data.find(k => !k.is_umum) || res.data.data[0];
          setCommunityName(own.nama_komunitas);
        }
      }).catch(() => { });
    } catch (e) { }
  }, []);

  const menuItems = [
    { id: 'admin-komunitas', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pelatihan-saya', label: 'Pelatihan Saya', icon: GraduationCap },
    { id: 'laporan-progress', label: 'Laporan Progress', icon: BarChart2 },
    { id: 'katalog-kursus', label: 'Katalog Kursus', icon: Book },
    { id: 'pusat-bantuan', label: 'Pusat Bantuan', icon: HelpCircle },
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
        {/* Logo Section */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-tight text-[#1D315F]">Buleleng ASN Corpu</h1>
              <p className="text-[10px] text-gray-500 font-medium">E-Learning System</p>
            </div>
          </div>

          <AdminKomunitasProfile currentUser={currentUser} communityName={communityName} onNavigate={onNavigate} />
        </div>

        <div className="flex-1 py-2 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-left truncate leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-2 mt-auto">
          <button
            onClick={() => onNavigate && onNavigate('pusat-bantuan')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors"
          >
            <HeadphonesIcon className="w-4 h-4" /> Bantuan Teknis
          </button>
          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminKomunitasSidebar;
