'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdminSidebar from '@/components/AdminSidebar';
import { ToastProvider } from '@/components/Toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ToastProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <Header />
        </div>
        
        {/* Mobile Menu Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#1a1a2e',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <div style={{ display: 'flex' }}>
          <AdminSidebar 
            isOpen={isMobile ? sidebarOpen : true} 
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          />
          <main
            style={{
              flex: 1,
              padding: '16px',
              minHeight: 'calc(100vh - 90px)',
              marginLeft: isMobile ? '0' : '250px',
              transition: 'margin-left 0.3s ease',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
