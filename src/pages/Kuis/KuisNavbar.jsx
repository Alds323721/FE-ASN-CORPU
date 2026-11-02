import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import ProfileDropdown from '../../components/ProfileDropdown';

export default function KuisNavbar({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">Dashboard</button>
        <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">Komunitas</button>
        <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">Katalog</button>
        <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] border-b-2 border-[#006A63] pb-1 cursor-pointer">Pelatihanku</button>
        <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">Sertifikat</button>
        <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">Bantuan</button>

        {/* Right icons */}
        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <button type="button" disabled title="Pilihan bahasa lain segera hadir" className="flex items-center gap-1 text-[#1D315F] opacity-70 text-xs font-semibold cursor-default">
            ID <ChevronDown className="w-3 h-3" />
          </button>
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden flex items-center gap-3">
        <ProfileDropdown onLogout={() => onNavigate('landing')} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors cursor-pointer">Dashboard</button>
          <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors cursor-pointer">Komunitas</button>
          <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors cursor-pointer">Katalog</button>
          <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] cursor-pointer">Pelatihanku</button>
          <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors cursor-pointer">Sertifikat</button>
          <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors cursor-pointer">Bantuan</button>
        </div>
      )}
    </nav>
  );
}
