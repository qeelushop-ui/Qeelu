'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';
import Image from 'next/image';
import Link from 'next/link';
import { getProductTitle } from '@/utils/getProductText';

const statusConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  pending: { color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', icon: '⏳' },
  processing: { color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.1)', icon: '⚙️' },
  shipped: { color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)', icon: '🚚' },
  delivered: { color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)', icon: '✅' },
  cancelled: { color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.1)', icon: '❌' },
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  const { orders, getOrderStats } = useOrders();
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  // Prevent hydration mismatch by only rendering dynamic data after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate product stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active' || !p.status).length;
  const inactiveProducts = products.filter(p => p.status === 'inactive').length;
  const totalCategories = [...new Set(products.map(p => p.category))].length;

  // Get order stats from context (only after mount to prevent hydration mismatch)
  const stats = mounted ? getOrderStats() : {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    pendingAmount: 0,
    processingAmount: 0,
    completedAmount: 0,
    cancelledAmount: 0,
    totalRevenue: 0,
    todayOrders: 0,
  };
  const {
    total: totalOrders,
    pending: pendingOrders,
    processing: processingOrders,
    shipped: shippedOrders,
    delivered: deliveredOrders,
    cancelled: cancelledOrders,
    pendingAmount,
    processingAmount,
    completedAmount,
    cancelledAmount,
    totalRevenue,
    todayOrders,
  } = stats;

  // Recent products & orders (only after mount to prevent hydration mismatch)
  const recentProducts = mounted ? products.slice(0, 5) : [];
  const recentOrders = mounted ? orders.slice(0, 5) : [];

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e' }}>
          {t('admin.menu.dashboard')}
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
          {t('admin.welcomeMessage')}
        </p>
      </div>

      {/* Revenue Overview Cards - Pending vs Completed (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
        {/* Pending Amount Card */}
        <Link href="/admin/orders?status=pending" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }} className="hover:scale-105 hover:shadow-lg">
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '100px' }}>⏳</div>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>{t('admin.dashboard.pendingAmount')}</p>
            <p style={{ fontSize: '32px', fontWeight: '700' }} suppressHydrationWarning>{pendingAmount.toFixed(2)} OMR</p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }} suppressHydrationWarning>
              {t('admin.dashboard.pendingOrdersCount', { count: pendingOrders })}
            </p>
          </div>
        </Link>

        {/* In Progress Amount Card */}
        <Link href="/admin/orders?status=processing" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }} className="hover:scale-105 hover:shadow-lg">
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '100px' }}>🚚</div>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>{t('admin.dashboard.inProgressAmount')}</p>
            <p style={{ fontSize: '32px', fontWeight: '700' }} suppressHydrationWarning>{processingAmount.toFixed(2)} OMR</p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }} suppressHydrationWarning>
              {t('admin.dashboard.inProgressOrdersCount', { count: processingOrders + shippedOrders })}
            </p>
          </div>
        </Link>

        {/* Completed Amount Card */}
        <Link href="/admin/orders?status=delivered" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }} className="hover:scale-105 hover:shadow-lg">
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '100px' }}>✅</div>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>{t('admin.dashboard.completedAmount')}</p>
            <p style={{ fontSize: '32px', fontWeight: '700' }} suppressHydrationWarning>{completedAmount.toFixed(2)} OMR</p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }} suppressHydrationWarning>
              {t('admin.dashboard.completedOrdersCount', { count: deliveredOrders })}
            </p>
          </div>
        </Link>

        {/* Cancelled Amount Card */}
        <Link href="/admin/orders?status=cancelled" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #78909C 0%, #455A64 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }} className="hover:scale-105 hover:shadow-lg">
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '100px' }}>❌</div>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>{t('admin.dashboard.cancelledAmount')}</p>
            <p style={{ fontSize: '32px', fontWeight: '700' }} suppressHydrationWarning>{cancelledAmount.toFixed(2)} OMR</p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }} suppressHydrationWarning>
              {t('admin.dashboard.cancelledOrdersCount', { count: cancelledOrders })}
            </p>
          </div>
        </Link>
      </div>

      {/* Total Revenue Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            💰
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{t('admin.dashboard.totalRevenue')}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#4CAF50' }} suppressHydrationWarning>{totalRevenue.toFixed(2)} OMR</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{t('admin.dashboard.totalOrders')}</p>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }} suppressHydrationWarning>{totalOrders}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{t('admin.dashboard.todayOrders')}</p>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }} suppressHydrationWarning>{todayOrders}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{t('admin.dashboard.avgOrderValue')}</p>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }} suppressHydrationWarning>{(totalRevenue / (totalOrders - cancelledOrders) || 0).toFixed(2)} OMR</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '12px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4CAF50',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#666' }}>{t('admin.stats.activeProducts')}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }} suppressHydrationWarning>{activeProducts}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(229, 57, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e53935',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#666' }}>{t('admin.stats.inactiveProducts')}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }} suppressHydrationWarning>{inactiveProducts}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2196F3',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#666' }}>{t('admin.stats.categories')}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }} suppressHydrationWarning>{totalCategories}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9C27B0',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#666' }}>{t('admin.dashboard.avgOrderValue')}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }} suppressHydrationWarning>${Math.round(totalRevenue / (totalOrders - cancelledOrders) || 0)}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders & Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '20px' }}>
        {/* Recent Orders */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
              {t('admin.dashboard.recentOrders')}
            </h2>
            <Link href="/admin/orders" style={{ color: '#4CAF50', fontSize: '13px', textDecoration: 'none' }}>
              {t('admin.viewAll')}
            </Link>
          </div>

          <div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1a1a2e',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}>
                    {mounted ? order.customer.charAt(0) : '?'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }} suppressHydrationWarning>{order.customer}</p>
                    <p style={{ fontSize: '12px', color: '#999' }} suppressHydrationWarning>#{order.id} • {order.city}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#4CAF50' }} suppressHydrationWarning>{order.total.toFixed(2)} OMR</p>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '500',
                    backgroundColor: statusConfig[order.status]?.bgColor,
                    color: statusConfig[order.status]?.color,
                  }} suppressHydrationWarning>
                    {statusConfig[order.status]?.icon} {t(`admin.orders.statuses.${order.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
              {t('admin.recentProducts')}
            </h2>
            <Link href="/admin/products" style={{ color: '#4CAF50', fontSize: '13px', textDecoration: 'none' }}>
              {t('admin.viewAll')}
            </Link>
          </div>

          <div>
            {recentProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <Image 
                    src={product.image} 
                    alt={getProductTitle(product, currentLang)} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#1a1a2e', 
                    fontWeight: '500',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                  }}>
                    {getProductTitle(product, currentLang)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#4CAF50', fontWeight: '600', fontSize: '14px' }}>
                      {product.currentPrice} OMR
                    </span>
                    <span style={{
                      backgroundColor: '#ffebee',
                      color: '#e53935',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}>
                      {product.discount}% OFF
                    </span>
                    <span style={{
                      backgroundColor: product.status === 'inactive' ? '#ffebee' : '#e8f5e9',
                      color: product.status === 'inactive' ? '#e53935' : '#4CAF50',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: '500',
                    }}>
                      {product.status === 'inactive' ? t('admin.inactive') : t('admin.active')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
