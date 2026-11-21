import React, { useState, useEffect } from 'react';
import LandingNavbar from './LandingPage/LandingNavbar';
import HeroSection from './LandingPage/HeroSection';
import AuthModal from './LandingPage/AuthModal';
import CategoriesSection from './LandingPage/CategoriesSection';
import CommunityRegistrationSection from './LandingPage/CommunityRegistrationSection';
import NewsSection from './LandingPage/NewsSection';
import HowItWorksSection from './LandingPage/HowItWorksSection';
import LandingFooter from './LandingPage/LandingFooter';
import { ChevronUp } from 'lucide-react';

export default function LandingPage({ onLogin, onNavigate }) {
  const [showAuth, setShowAuth] = useState(false);
  const [intendedRoute, setIntendedRoute] = useState('dashboard');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthClick = (route = 'dashboard') => {
    setIntendedRoute(route);
    setShowAuth(true);
  };

  const handleSearch = (term) => {
    if (onNavigate) {
      onNavigate('catalog', { search: term });
    } else {
      handleAuthClick('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-white">
      {/* 2. Navigasi menu dihilangkan, 3. Logo LAN RI ditambahkan */}
      <LandingNavbar 
        onLoginClick={() => handleAuthClick('dashboard')} 
      />
      
      <main className="flex-grow pt-16 sm:pt-18">
        {/* 4. Tombol hanya 2 (HCDP & IDP -> website IDP, LMS -> /LMS), 5. Font Selamat datang di */}
        <HeroSection 
          onAuthClick={() => handleAuthClick('dashboard')} 
          onSearch={handleSearch}
        />
        
        {/* Kategori Pelatihan */}
        <div id="kategori-pelatihan" className="scroll-reveal">
          <CategoriesSection onSelectCategory={(catTitle) => handleSearch(catTitle)} />
        </div>
        
        {/* Formulir Pendaftaran Komunitas (Mekanisme Lama) */}
        <div id="pendaftaran-komunitas" className="scroll-reveal">
          <CommunityRegistrationSection />
        </div>
        
        {/* Berita Terbaru */}
        <div className="scroll-reveal">
          <NewsSection />
        </div>
        
        {/* Cara Kerja Platform */}
        <div className="scroll-reveal">
          <HowItWorksSection 
            onLoginClick={() => handleAuthClick('dashboard')} 
            onExploreCourses={() => {
              const el = document.getElementById('kategori-pelatihan');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </main>

      {/* Floating Back-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-gradient-to-tr from-[#006A63] to-[#0284C7] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer animate-in fade-in zoom-in duration-300"
          title="Kembali ke atas"
          aria-label="Kembali ke atas"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Footer dengan Logo LAN RI */}
      <LandingFooter onFooterLinkClick={handleAuthClick} />

      {/* 2-Panel Auth Modal untuk Login LMS */}
      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        onLogin={() => onLogin(intendedRoute)}
      />
    </div>
  );
}
