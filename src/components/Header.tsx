'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    // Get initial language from i18n
    const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
    setCurrentLang(lang);
    // Update HTML dir attribute for RTL support (but header stays LTR)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  const isArabic = currentLang === 'ar';

  const toggleLanguage = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <header 
      className="bg-white"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      dir="ltr" // Header always LTR to keep button position fixed
    >
      {/* Centered Container */}
      <div 
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <div 
          className="flex items-center justify-between relative"
          style={{ height: '90px' }}
        >
          {/* Language Toggle Button - Always on left */}
          <button 
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            style={{ 
              border: '1px solid #e0e0e0',
              backgroundColor: '#fafafa'
            }}
          >
            {isArabic ? (
              <>
                <Image
                  src="https://flagcdn.com/w40/gb.png"
                  alt="English"
                  width={24}
                  height={16}
                  className="rounded-sm"
                />
                <span style={{ fontSize: '13px', color: '#333333', fontWeight: '500' }}>
                  English
                </span>
              </>
            ) : (
              <>
                <Image
                  src="https://flagcdn.com/w40/sa.png"
                  alt="Arabic"
                  width={24}
                  height={16}
                  className="rounded-sm"
                />
                <span style={{ fontSize: '13px', color: '#333333', fontWeight: '500' }}>
                  عربي
                </span>
              </>
            )}
          </button>

          {/* Center Logo - Image */}
          <Link 
            href="/" 
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <Image
              src="/Qeelu.png"
              alt="Qeelu Logo"
              width={220}
              height={90}
              style={{ width: 'auto', height: '75px' }}
              priority
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            className="md:hidden flex flex-col p-2"
            style={{ gap: '4px' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`bg-gray-600 block ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
            <span className={`bg-gray-600 block ${mobileMenuOpen ? 'opacity-0' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
            <span className={`bg-gray-600 block ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ width: '20px', height: '2px', transition: 'all 0.2s' }}></span>
          </button>

          {/* Empty div for flex balance on desktop */}
          <div className="hidden md:block" style={{ width: '50px' }}></div>
        </div>
      </div>
    </header>
  );
}
