'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  BiSpa,
  BiChip,
  BiTime,
  BiPhone,
  BiDish,
  BiCar,
  BiBox,
  BiTimeFive,
  BiCog,
  BiPackage,
  BiCheckCircle,
  BiXCircle
} from 'react-icons/bi';

// Categories for dropdown (excluding 'all')
const categoryItems = [
  { id: 'cosmetics', icon: BiSpa },
  { id: 'electronics', icon: BiChip },
  { id: 'watches', icon: BiTime },
  { id: 'mobile', icon: BiPhone },
  { id: 'kitchen', icon: BiDish },
  { id: 'car', icon: BiCar },
  { id: 'other', icon: BiBox },
];

// Order statuses for dropdown
const orderStatusItems = [
  { id: 'pending', icon: BiTimeFive },
  { id: 'processing', icon: BiCog },
  { id: 'shipped', icon: BiPackage },
  { id: 'delivered', icon: BiCheckCircle },
  { id: 'cancelled', icon: BiXCircle },
];

const menuItems = [
  {
    id: 'dashboard',
    href: '/admin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'products',
    href: '/admin/products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

function AdminSidebarContent({ isOpen, onClose, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  
  // Get active category and status from URL
  const activeCategory = searchParams.get('category');
  const activeStatus = searchParams.get('status');
  
  // Auto-open dropdowns when active
  useEffect(() => {
    if (activeCategory && pathname === '/admin/products') {
      setCategoriesOpen(true);
    }
    if (activeStatus && pathname === '/admin/orders') {
      setOrdersOpen(true);
    }
  }, [activeCategory, activeStatus, pathname]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '250px',
          height: 'calc(100vh - 90px)',
          backgroundColor: '#1a1a2e',
          position: 'fixed',
          top: '90px',
          bottom: 0,
          left: isOpen ? 0 : '-250px',
          zIndex: 50,
          transition: 'left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Admin Title */}
        <div
          style={{
            padding: '20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
            {t('admin.panel')}
          </h2>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                color: '#fff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Menu Items - Scrollable */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: '10px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => {
              // Products should not be active if a category is selected
              const isActive = item.id === 'products' 
                ? pathname === item.href && !activeCategory
                : pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 20px',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderLeft: isActive ? '3px solid #4CAF50' : '3px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/5"
                  >
                    <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: isActive ? '500' : '400' }}>
                      {t(`admin.menu.${item.id}`)}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Categories Dropdown */}
            <li>
              {(() => {
                const hasCategoryActive = activeCategory && pathname === '/admin/products';
                return (
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 20px',
                      color: hasCategoryActive ? '#fff' : 'rgba(255,255,255,0.7)',
                      backgroundColor: hasCategoryActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderLeft: hasCategoryActive ? '3px solid #4CAF50' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/5"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: hasCategoryActive ? 1 : 0.7 }}>
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: hasCategoryActive ? '500' : '400' }}>
                        {t('admin.menu.categories')}
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: categoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                );
              })()}

              {/* Dropdown Items */}
              <div
                style={{
                  maxHeight: categoriesOpen ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                {categoryItems.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActiveCategory = activeCategory === cat.id && pathname === '/admin/products';
                  return (
                    <Link
                      key={cat.id}
                      href={`/admin/products?category=${cat.id}`}
                      onClick={isMobile ? onClose : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px 12px 48px',
                        color: isActiveCategory ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActiveCategory ? '600' : '400',
                        transition: 'all 0.2s ease',
                        backgroundColor: isActiveCategory ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                        borderLeft: isActiveCategory ? '3px solid #4CAF50' : '3px solid transparent',
                      }}
                      className={isActiveCategory ? '' : 'hover:bg-white/5 hover:text-white'}
                    >
                      <IconComponent size={16} style={{ color: isActiveCategory ? '#4CAF50' : 'inherit' }} />
                      <span>{t(`categories.${cat.id}`)}</span>
                    </Link>
                  );
                })}
              </div>
            </li>

            {/* Orders Dropdown */}
            <li>
              {(() => {
                const hasStatusActive = activeStatus && pathname === '/admin/orders';
                const isOrdersPage = pathname === '/admin/orders';
                return (
                  <button
                    onClick={() => setOrdersOpen(!ordersOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 20px',
                      color: isOrdersPage ? '#fff' : 'rgba(255,255,255,0.7)',
                      backgroundColor: isOrdersPage ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: 'none',
                      borderLeft: isOrdersPage ? '3px solid #4CAF50' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:bg-white/5"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: isOrdersPage ? 1 : 0.7 }}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span style={{ fontSize: '14px', fontWeight: isOrdersPage ? '500' : '400' }}>
                        {t('admin.menu.orders')}
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: ordersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                );
              })()}

              {/* Orders Dropdown Items */}
              <div
                style={{
                  maxHeight: ordersOpen ? '400px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                {/* All Orders */}
                <Link
                  href="/admin/orders"
                  onClick={isMobile ? onClose : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px 12px 48px',
                    color: pathname === '/admin/orders' && !activeStatus ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: pathname === '/admin/orders' && !activeStatus ? '600' : '400',
                    transition: 'all 0.2s ease',
                    backgroundColor: pathname === '/admin/orders' && !activeStatus ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    borderLeft: pathname === '/admin/orders' && !activeStatus ? '3px solid #4CAF50' : '3px solid transparent',
                  }}
                  className={pathname === '/admin/orders' && !activeStatus ? '' : 'hover:bg-white/5 hover:text-white'}
                >
                  <BiBox size={16} style={{ color: pathname === '/admin/orders' && !activeStatus ? '#4CAF50' : 'inherit' }} />
                  <span>{t('admin.orders.all')}</span>
                </Link>
                
                {orderStatusItems.map((status) => {
                  const IconComponent = status.icon;
                  const isActiveStatus = activeStatus === status.id && pathname === '/admin/orders';
                  return (
                    <Link
                      key={status.id}
                      href={`/admin/orders?status=${status.id}`}
                      onClick={isMobile ? onClose : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px 12px 48px',
                        color: isActiveStatus ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActiveStatus ? '600' : '400',
                        transition: 'all 0.2s ease',
                        backgroundColor: isActiveStatus ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                        borderLeft: isActiveStatus ? '3px solid #4CAF50' : '3px solid transparent',
                      }}
                      className={isActiveStatus ? '' : 'hover:bg-white/5 hover:text-white'}
                    >
                      <IconComponent size={16} style={{ color: isActiveStatus ? '#4CAF50' : 'inherit' }} />
                      <span>{t(`admin.orders.statuses.${status.id}`)}</span>
                    </Link>
                  );
                })}
              </div>
            </li>

            {/* Unsubmitted Orders */}
            <li>
              <Link
                href="/admin/unsubmitted"
                onClick={isMobile ? onClose : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: pathname === '/admin/unsubmitted' ? '#fff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: pathname === '/admin/unsubmitted' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: pathname === '/admin/unsubmitted' ? '3px solid #FF9800' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: pathname === '/admin/unsubmitted' ? '500' : '400',
                  transition: 'all 0.2s ease',
                }}
                className={pathname === '/admin/unsubmitted' ? '' : 'hover:bg-white/5 hover:text-white'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: pathname === '/admin/unsubmitted' ? 1 : 0.7 }}>
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>{t('admin.menu.unsubmitted', { defaultValue: 'Unsubmitted Orders' })}</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Back to Store - Fixed at Bottom */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: '#16162b',
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '400',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease',
            }}
            className="hover:bg-white/10 hover:border-white/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {t('admin.backToStore')}
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <Suspense fallback={null}>
      <AdminSidebarContent {...props} />
    </Suspense>
  );
}
