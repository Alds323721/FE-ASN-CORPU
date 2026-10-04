import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../../assets/logo-removebg-preview 1.png';
import asnCorpuLogo from '../../assets/ASN-CORPU.png';

export default function LandingFooter({ onFooterLinkClick }) {
  return (
    <footer className="bg-[#EAEFF4] pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-5 pr-8">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
            <img src={logoImg} alt="Logo BKPSDM" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <img src={asnCorpuLogo} alt="Logo ASN Corpu" className="w-8 sm:w-9 h-8 sm:h-9 object-contain" />
            <span className="font-semibold text-xl text-[#1D315F]">Buleleng ASN Corpu</span>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
            Platform Digital ASN untuk pengembangan kompetensi<br />dan peningkatan kapasitas secara berkelanjutan.
          </p>
          <p className="text-[11px] text-gray-500">
            © 2026 BKPSDM. Hak Cipta Dilindungi Undang-Undang. Platform Digital ASN.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-bold text-[#1D315F] text-[14px] mb-6">Tautan Cepat</h4>
          <ul className="text-[13px] text-gray-600 space-y-3 font-medium">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('courses'); }} className="hover:text-[#006A63] transition-colors">Pelatihan</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('community'); }} className="hover:text-[#006A63] transition-colors">Komunitas</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onFooterLinkClick('help-center'); }} className="hover:text-[#006A63] transition-colors">Bantuan</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-[#1D315F] text-[14px] mb-6">Kontak Kami</h4>
          <ul className="text-[13px] text-gray-600 space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
              <span className="font-medium">support@bkpsdm-pintar.go.id</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
              <span className="font-medium">(021) 123-4567 (Jam Kerja)</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#3FCDC1] mt-0.5 flex-shrink-0" />
              <span className="font-medium leading-relaxed">Gedung Kepegawaian Lt. 3, Jl. Protokol<br />No. 1, Jakarta</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
