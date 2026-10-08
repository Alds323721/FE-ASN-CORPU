import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../assets/ASN-CORPU.png';
import { useLanguage } from '../context/LanguageContext';

export const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

export const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

export const YoutubeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.418-7.814.418-7.814.418s-6.255 0-7.814-.418a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.256 0 7.812.418zM10 15.5l6-3.5-6-3.5v7z" clipRule="evenodd" />
  </svg>
);

export default function Footer({ onNavigate, onFooterLinkClick, className = '' }) {
  const { t } = useLanguage();

  const handleLink = (e, routeName, fallbackNavigate) => {
    e.preventDefault();
    if (onFooterLinkClick) {
      onFooterLinkClick(routeName);
    } else if (onNavigate) {
      onNavigate(fallbackNavigate || routeName);
    }
  };

  return (
    <footer className={`bg-[#EAEFF4] pt-16 pb-8 border-t border-[#BBC9C7] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        {/* Kolom 1: Profil & Brand */}
        <div className="md:col-span-5 pr-4 md:pr-8">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6 font-medium">
            {t ? t('footer.tagline') : 'Platform Digital ASN untuk pengembangan kompetensi dan peningkatan kapasitas secara berkelanjutan.'}
          </p>
          <p className="text-[11px] text-gray-500 font-semibold">
            {t ? t('footer.copyright') : '© 2026 BKPSDM. Hak Cipta Dilindungi Undang-Undang. Platform Digital ASN.'}
          </p>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div className="md:col-span-3">
          <h4 className="font-bold text-[#1D315F] text-[15px] mb-6">
            {t ? t('footer.quickLinks') : 'Tautan Cepat'}
          </h4>
          <ul className="text-[13px] text-[#1D315F] space-y-3 font-semibold">
            <li>
              <a 
                href="#" 
                onClick={(e) => handleLink(e, 'courses', 'catalog')} 
                className="hover:text-[#006A63] transition-colors"
              >
                {t ? t('footer.courses') : 'Pelatihan'}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => handleLink(e, 'community', 'community')} 
                className="hover:text-[#006A63] transition-colors"
              >
                {t ? t('footer.community') : 'Komunitas'}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => handleLink(e, 'help-center', 'help-center')} 
                className="hover:text-[#006A63] transition-colors"
              >
                {t ? t('footer.help') : 'Bantuan'}
              </a>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Kontak Kami & Media Sosial */}
        <div className="md:col-span-4">
          <h4 className="font-bold text-[#1D315F] text-[15px] mb-6">
            {t ? t('footer.contactUs') : 'Kontak Kami'}
          </h4>
          <ul className="text-[13px] text-gray-600 space-y-3.5">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#006A63] mt-0.5 shrink-0" />
              <a 
                href="mailto:bkpsdm@bulelengkab.go.id" 
                className="font-semibold text-gray-700 hover:text-[#006A63] transition-colors break-all"
              >
                bkpsdm@bulelengkab.go.id
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#006A63] mt-0.5 shrink-0" />
              <a 
                href="tel:03623301891" 
                className="font-semibold text-gray-700 hover:text-[#006A63] transition-colors"
              >
                (0362) 3301891
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#006A63] mt-0.5 shrink-0" />
              <span className="font-semibold text-gray-700 leading-relaxed">
                Jln. Laksamana Baktiseraga (LC)
              </span>
            </li>
          </ul>

          {/* Media Sosial */}
          <div className="mt-5 pt-4 border-t border-[#BBC9C7]/60">
            <p className="text-xs font-semibold text-[#1D315F] mb-3">
              {t ? (t('footer.socialMedia') || 'Media Sosial') : 'Media Sosial'}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/bkd.buleleng.5/"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook BKPSDM Buleleng"
                aria-label="Facebook BKPSDM Buleleng"
                className="w-8 h-8 rounded-full bg-white border border-[#BBC9C7] flex items-center justify-center text-[#1D315F] hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-200 shadow-xs hover:scale-105"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/bkpsdm_buleleng/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram BKPSDM Buleleng"
                aria-label="Instagram BKPSDM Buleleng"
                className="w-8 h-8 rounded-full bg-white border border-[#BBC9C7] flex items-center justify-center text-[#1D315F] hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-200 shadow-xs hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/results?search_query=bkpsdm+buleleng"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube BKPSDM Buleleng"
                aria-label="YouTube BKPSDM Buleleng"
                className="w-8 h-8 rounded-full bg-white border border-[#BBC9C7] flex items-center justify-center text-[#1D315F] hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all duration-200 shadow-xs hover:scale-105"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
