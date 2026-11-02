import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import ProfileDropdown from '../../components/ProfileDropdown';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLanguage } from '../../context/LanguageContext';

export default function CourseDetailNavbar({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src={logoImg} alt="Logo BKPSDM" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-6 sm:w-8 h-6 sm:h-8 object-contain" />
        <span className="font-semibold text-base sm:text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-[#1D315F] font-semibold text-sm">
        <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.dashboard')}</button>
        <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.community')}</button>
        <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.catalog')}</button>
        <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] border-b-2 border-[#006A63] pb-1 cursor-pointer">{t('nav.myCourses')}</button>
        <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.certificates')}</button>
        <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors pb-1 cursor-pointer">{t('nav.helpCenter')}</button>

        <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-6">
          <LanguageDropdown />
          <ProfileDropdown onLogout={() => onNavigate('landing')} />
        </div>
      </div>

      <div className="md:hidden flex items-center gap-3">
        <LanguageDropdown />
        <ProfileDropdown onLogout={() => onNavigate('landing')} />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#1D315F] hover:text-[#006A63] focus:outline-none">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-md md:hidden flex flex-col py-4 px-6 gap-4 text-[#1D315F] font-semibold text-sm z-50">
          <button type="button" onClick={() => onNavigate('dashboard')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.dashboard')}</button>
          <button type="button" onClick={() => onNavigate('community')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.community')}</button>
          <button type="button" onClick={() => onNavigate('catalog')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.catalog')}</button>
          <button type="button" onClick={() => onNavigate('my-courses')} className="text-[#006A63] cursor-pointer">{t('nav.myCourses')}</button>
          <button type="button" onClick={() => onNavigate('certificates')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.certificates')}</button>
          <button type="button" onClick={() => onNavigate('help-center')} className="hover:text-[#006A63] transition-colors cursor-pointer">{t('nav.helpCenter')}</button>
        </div>
      )}
    </nav>
  );
}
