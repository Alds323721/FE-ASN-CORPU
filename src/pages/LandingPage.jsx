import React, { useState } from 'react';
import LandingNavbar from './LandingPage/LandingNavbar';
import HeroSection from './LandingPage/HeroSection';
import AuthModal from './LandingPage/AuthModal';
import CategoriesSection from './LandingPage/CategoriesSection';
import PopularCoursesSection from './LandingPage/PopularCoursesSection';
import NewsSection from './LandingPage/NewsSection';
import HowItWorksSection from './LandingPage/HowItWorksSection';
import LandingFooter from './LandingPage/LandingFooter';

export default function LandingPage({ onLogin, onNavigate }) {
  const [showAuth, setShowAuth] = useState(false);
  const [intendedRoute, setIntendedRoute] = useState('dashboard');

  const handleAuthClick = (route = 'dashboard') => {
    setIntendedRoute(route);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-white">
      <LandingNavbar 
        onLoginClick={() => handleAuthClick('dashboard')} 
        onNavigatePortal={() => onNavigate && onNavigate('portal')}
      />
      
      <main className="flex-grow pt-14 sm:pt-16">
        <HeroSection onAuthClick={() => handleAuthClick('dashboard')} />
        <CategoriesSection />
        <PopularCoursesSection />
        <NewsSection />
        <HowItWorksSection />
      </main>

      <LandingFooter onFooterLinkClick={handleAuthClick} />

      {/* 2-Panel Auth Modal */}
      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        onLogin={() => onLogin(intendedRoute)}
      />
    </div>
  );
}
