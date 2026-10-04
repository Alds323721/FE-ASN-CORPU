import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';
import { useLanguage } from '../../context/LanguageContext';

export default function CourseFooter({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#EAEFF4] pt-16 pb-8 border-t border-[#BBC9C7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-5 pr-8">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-semibold">
            {t('footer.tagline')}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">
            {t('footer.copyright')}
          </p>
        </div>
        <div className="md:col-span-3">
          <h4 className="font-semibold text-[#1D315F] text-[15px] mb-6">{t('footer.quickLinks')}</h4>
          <ul className="text-[13px] text-[#1D315F] space-y-3 font-semibold">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('catalog'); }} className="hover:text-[#006A63] transition-colors">{t('footer.courses')}</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('community'); }} className="hover:text-[#006A63] transition-colors">{t('footer.community')}</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('help-center'); }} className="hover:text-[#006A63] transition-colors">{t('footer.help')}</a></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <h4 className="font-semibold text-[#1D315F] text-[15px] mb-6">{t('footer.contactUs')}</h4>
          <ul className="text-[13px] text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold">support@bkpsdm-pintar.go.id</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold">(021) 123-4567 (Jam Kerja)</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#006A63] mt-0.5 flex-shrink-0" />
              <span className="font-semibold leading-relaxed">Gedung Kepegawaian Lt. 3, Jl. Protokol<br />No. 1, Jakarta</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
