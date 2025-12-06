'use client';

import { useState, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrders, Order } from '@/context/OrderContext';
import { useProducts } from '@/context/ProductContext';
import { useToast } from '@/components/Toast';
import { cities, getCityName } from '@/data/products';
import Image from 'next/image';
import * as XLSX from 'xlsx';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { color: string; bgColor: string; icon: string }> = {
  pending: { color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', icon: '⏳' },
  processing: { color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.1)', icon: '⚙️' },
  shipped: { color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)', icon: '🚚' },
  delivered: { color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)', icon: '✅' },
  cancelled: { color: '#f44336', bgColor: 'rgba(244, 67, 54, 0.1)', icon: '❌' },
};

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, orderData: Partial<Order>) => void;
}

function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus }: OrderDetailModalProps) {
  const { t } = useTranslation();
  const { products } = useProducts();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  
  // Update selectedStatus when modal opens
  useEffect(() => {
    if (order && isOpen) {
      setSelectedStatus(order.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, isOpen, order?.status]);
  
  if (!isOpen || !order) return null;

  const hasStatusChanged = selectedStatus !== order.status;
  
  const handleSave = () => {
    if (hasStatusChanged) {
      onUpdateStatus(order.id, selectedStatus);
    }
  };

  // Helper function to get product image by name
  const getProductImage = (productName: string) => {
    if (!productName) return 'https://via.placeholder.com/100';
    const product = products.find(p => {
      const titleEn = typeof p.title === 'object' ? p.title.en : p.title;
      const titleAr = typeof p.title === 'object' ? p.title.ar : '';
      return titleEn.toLowerCase().includes(productName.toLowerCase()) ||       
        productName.toLowerCase().includes(titleEn.toLowerCase()) ||       
        (titleAr && titleAr.toLowerCase().includes(productName.toLowerCase()));
    });
    return product?.image || product?.images?.[0] || 'https://via.placeholder.com/100';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
              {t('admin.orders.orderDetails')}
            </h2>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Status - Merged with Dropdown */}
          <div style={{
            backgroundColor: statusConfig[selectedStatus as OrderStatus]?.bgColor || '#f8f9fa',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '24px',
            border: `2px solid ${statusConfig[selectedStatus as OrderStatus]?.color}40`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              {/* Current Status Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '28px' }}>{statusConfig[selectedStatus as OrderStatus]?.icon}</span>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{t('admin.orders.status')}</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: statusConfig[selectedStatus as OrderStatus]?.color,
                    textTransform: 'capitalize',
                  }}>
                    {t(`admin.orders.statuses.${selectedStatus}`)}
                  </p>
                </div>
              </div>
              
              {/* Dropdown and Save Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{ minWidth: '180px' }}>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      paddingRight: '36px',
                      borderRadius: '10px',
                      border: `1.5px solid ${statusConfig[selectedStatus as OrderStatus]?.color || '#ddd'}`,
                      backgroundColor: '#fff',
                      color: '#1a1a2e',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                      <option 
                        key={status} 
                        value={status}
                        style={{
                          backgroundColor: '#fff',
                          color: '#1a1a2e',
                          padding: '8px',
                        }}
                      >
                        {statusConfig[status].icon} {t(`admin.orders.statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Save Button */}
                {hasStatusChanged && (
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    className="hover:opacity-90"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {t('admin.orders.save')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '12px' }}>
              {t('admin.orders.customerInfo')}
            </h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  {order.customer.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{order.customer}</p>
                  <p style={{ fontSize: '13px', color: '#666' }}>{order.phone}</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{t('admin.orders.deliveryAddress')}</p>
                <p style={{ fontSize: '13px', color: '#333' }}>{order.city}, {order.address}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '12px' }}>
              {t('admin.orders.products')} ({order.products.length})
            </h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {order.products.map((product, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 14px',
                    borderBottom: index < order.products.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    backgroundColor: '#f5f5f5',
                  }}>
                    <Image 
                      src={getProductImage(product.name)} 
                      alt={product.name} 
                      fill 
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: '500', marginBottom: '4px' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                      Quantity: x{product.quantity}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#4CAF50' }}>
                      {product.price * product.quantity} OMR
                    </p>
                  </div>
                </div>
              ))}
              <div style={{
                padding: '14px',
                backgroundColor: '#1a1a2e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>{t('admin.orders.total')}</span>
                <span style={{ fontSize: '18px', color: '#4CAF50', fontWeight: '700' }}>{order.total.toFixed(2)} OMR</span>
              </div>
            </div>
          </div>

          {/* Order Time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            marginBottom: '20px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: '13px', color: '#666' }}>
              {order.date} • {order.time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Order Modal Component
function EditOrderModal({ order, isOpen, onClose, onSave }: EditOrderModalProps) {
  const { t } = useTranslation();
  const { products: allProducts } = useProducts();
  
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    city: '',
    address: '',
    products: [] as Array<{name: string; quantity: number; price: number}>,
  });

  // Update form when order changes
  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        customer: order.customer,
        phone: order.phone,
        city: order.city,
        address: order.address,
        products: order.products || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, isOpen]);

  if (!isOpen || !order) return null;

  const handleSave = () => {
    // Calculate new total based on updated products
    const newTotal = formData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    onSave(order.id, { ...formData, total: newTotal });
    onClose();
  };
  
  const updateProductQuantity = (index: number, newQuantity: number) => {
    const updatedProducts = [...formData.products];
    const productName = updatedProducts[index].name;
    
    // Find product in database to get pricing tiers
    const dbProduct = allProducts.find(p => {
      const titleEn = typeof p.title === 'object' ? p.title.en : p.title;
      const titleAr = typeof p.title === 'object' ? p.title.ar : '';
      return titleEn === productName || titleAr === productName || 
             productName.includes(titleEn) || titleEn.includes(productName);
    });
    
    // Calculate price based on pricing tiers if available
    if (dbProduct?.pricingTiers && dbProduct.pricingTiers.length > 0) {
      const tier = dbProduct.pricingTiers.find(t => t.quantity === newQuantity);
      if (tier) {
        // Use tier price (already total for that quantity)
        updatedProducts[index].price = tier.price / tier.quantity; // Store unit price
      } else {
        // Use closest tier or default price
        updatedProducts[index].price = dbProduct.currentPrice;
      }
    }
    
    updatedProducts[index].quantity = newQuantity;
    setFormData({ ...formData, products: updatedProducts });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
              {t('admin.orders.editOrder')}
            </h2>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div style={{ padding: '20px' }}>
          {/* Customer Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
              {t('admin.orders.customerName')} <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e8e8e8',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#000',
                outline: 'none',
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
              {t('admin.orders.phone')} <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e8e8e8',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#000',
                outline: 'none',
              }}
            />
          </div>

          {/* City */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
              {t('admin.orders.city')} <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e8e8e8',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#000',
                backgroundColor: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">{t('admin.orders.selectCity', { defaultValue: 'Select City' })}</option>
              {cities.map((city, idx) => {
                const cityName = getCityName(city, 'en');
                return (
                  <option key={idx} value={cityName}>{cityName}</option>
                );
              })}
            </select>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
              {t('admin.orders.address')} <span style={{ color: '#e53935' }}>*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e8e8e8',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#000',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Products - Editable Quantity */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            border: '2px solid #e3f2fd',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px', textTransform: 'uppercase' }}>
              🛒 {t('admin.orders.products')}
            </h3>
            {formData.products.map((product, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '10px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Price: {product.price.toFixed(2)} OMR
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 1)}
                    style={{
                      width: '70px',
                      padding: '8px',
                      border: '2px solid #2196F3',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#000',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#4CAF50',
                  minWidth: '70px',
                  textAlign: 'right'
                }}>
                  {(product.price * product.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div style={{ 
              borderTop: '2px solid #e0e0e0', 
              marginTop: '12px', 
              paddingTop: '12px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e' }}>
                {t('admin.orders.total')}
              </span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#4CAF50' }}>
                {formData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)} OMR
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                backgroundColor: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#666',
              }}
            >
              {t('admin.cancel')}
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '14px',
                border: 'none',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {t('admin.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminOrdersContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get('status');
  const { showToast } = useToast();
  
  // Use orders from context
  const { orders, updateOrder, updateOrderStatus, deleteOrder, getOrderStats } = useOrders();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(25);

  // Use URL param as source of truth
  const filterStatus = statusParam || 'all';
  
  // Update URL when filter changes (button click)
  const setFilterStatus = (status: string) => {
    // Clear selected orders when switching tabs
    setSelectedOrders([]);
    // Reset to page 1 when changing filters
    setCurrentPage(1);
    
    const newStatus = status === 'all' ? null : status;
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setOrdersPerPage(value);
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

  // Get stats from context
  const orderStats = getOrderStats();
  const stats = {
    total: orderStats.total,
    pending: orderStats.pending,
    processing: orderStats.processing,
    shipped: orderStats.shipped,
    delivered: orderStats.delivered,
    cancelled: orderStats.cancelled,
    revenue: orderStats.totalRevenue,
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setOpenStatusDropdown(null); // Close dropdown after status change
    showToast('Record Updated', 'info');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openStatusDropdown) {
        setOpenStatusDropdown(null);
      }
      // Close export and print dropdowns
      const target = e.target as HTMLElement;
      const exportContainer = document.getElementById('export-dropdown-container');
      const printContainer = document.getElementById('print-dropdown-container');
      
      if (exportContainer && !exportContainer.contains(target)) {
        const exportDropdown = document.getElementById('export-dropdown');
        if (exportDropdown) exportDropdown.style.display = 'none';
      }
      if (printContainer && !printContainer.contains(target)) {
        const printDropdown = document.getElementById('print-dropdown');
        if (printDropdown) printDropdown.style.display = 'none';
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openStatusDropdown]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = (orderId: string, orderData: Partial<Order>) => {
    updateOrder(orderId, orderData);
    setIsEditModalOpen(false);
    setEditingOrder(null);
    showToast('Changes Saved', 'success');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(t('admin.orders.deleteConfirm'))) {
      deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
      showToast('Item Deleted Successfully', 'success');
    }
  };

  // Helper function to get product image by name (same as in modal)
  const getProductImage = (productName: string) => {
    if (!productName) return 'https://via.placeholder.com/100';
    const product = products.find(p => {
      const titleEn = typeof p.title === 'object' ? p.title.en : p.title;
      const titleAr = typeof p.title === 'object' ? p.title.ar : '';
      return titleEn.toLowerCase().includes(productName.toLowerCase()) ||       
        productName.toLowerCase().includes(titleEn.toLowerCase()) ||       
        (titleAr && titleAr.toLowerCase().includes(productName.toLowerCase()));
    });
    return product?.image || product?.images?.[0] || 'https://via.placeholder.com/100';
  };

  // Handle checkbox selection
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // Bulk status change for selected orders
  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    const count = selectedOrders.length;
    const orderIds = [...selectedOrders]; // Copy array
    
    try {
      // Update all selected orders via API directly
      for (const orderId of orderIds) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const updatedOrder = { ...order, status: newStatus };
          
          await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedOrder),
          });
        }
      }
      
      // Refresh orders from API after bulk update
      const response = await fetch('/api/orders', { cache: 'no-store' });
      if (response.ok) {
        // Refresh page to show updated orders
        window.location.reload();
      }
      
      // Clear selection
      setSelectedOrders([]);
      
      showToast(`${count} orders updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating orders:', error);
      showToast('Failed to update orders', 'error');
    }
  };

  // Export to Excel function
  const exportToExcel = (ordersToExport: Order[]) => {
    if (ordersToExport.length === 0) {
      alert(t('admin.orders.export.noOrdersSelected'));
      return;
    }

    // Prepare data for Excel
    const excelData = ordersToExport.map(order => ({
      'Order ID': order.id,
      'Customer': order.customer,
      'Phone': order.phone,
      'City': order.city,
      'Address': order.address,
      'Products': order.products.map(p => `${p.name} (x${p.quantity})`).join(', '),
      'Total (OMR)': order.total,
      'Status': order.status,
      'Date': order.date,
      'Time': order.time,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Order ID
      { wch: 20 }, // Customer
      { wch: 15 }, // Phone
      { wch: 15 }, // City
      { wch: 30 }, // Address
      { wch: 50 }, // Products
      { wch: 12 }, // Total
      { wch: 12 }, // Status
      { wch: 12 }, // Date
      { wch: 10 }, // Time
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Orders');

    // Generate filename with current date and status
    const dateStr = new Date().toISOString().split('T')[0];
    const statusStr = filterStatus === 'all' ? 'All' : filterStatus;
    const filename = `Orders_${statusStr}_${dateStr}.xlsx`;

    // Export file
    XLSX.writeFile(wb, filename);

    // Clear selection after export
    setSelectedOrders([]);
  };

  const handleExportSelected = () => {
    const ordersToExport = orders.filter(o => selectedOrders.includes(o.id));
    exportToExcel(ordersToExport);
  };

  const handleExportAll = () => {
    exportToExcel(filteredOrders);
  };

  // Print orders function
  const printOrders = (ordersToPrint: Order[], pageSize: 'A4' | 'A5' = 'A4') => {
    if (ordersToPrint.length === 0) {
      showToast('No orders selected to print', 'error');
      return;
    }

    // Create a print-friendly HTML content
      const printContent = ordersToPrint.map((order, index) => {
      const productsList = order.products.map(p => 
        `${p.name} (Qty: ${p.quantity}, Price: ${p.price.toFixed(2)} OMR)`
      ).join('<br>');

      return `
        <div class="order-page" style="page-break-after: ${index < ordersToPrint.length - 1 ? 'always' : 'auto'}; padding: ${pageSize === 'A5' ? '15px' : '20px'}; border: 1px solid #ddd; margin-bottom: ${pageSize === 'A5' ? '15px' : '20px'}; font-family: Arial, sans-serif;">
          <!-- Header with Logo and Barcode -->
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${pageSize === 'A5' ? '15px' : '20px'}; border-bottom: 2px solid #000; padding-bottom: ${pageSize === 'A5' ? '10px' : '15px'};">
            <div style="flex: 1;">
              <div style="font-size: ${pageSize === 'A5' ? '18px' : '24px'}; font-weight: bold; margin-bottom: 5px;">Qeelu Store</div>
              <div style="font-size: ${pageSize === 'A5' ? '10px' : '12px'}; color: #666;">SIMPLIFIED TAX INVOICE</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: ${pageSize === 'A5' ? '14px' : '18px'}; font-weight: bold; margin-bottom: 5px;">Order #${order.id}</div>
              <div style="font-size: ${pageSize === 'A5' ? '10px' : '12px'}; color: #666;">Date: ${order.date} ${order.time}</div>
            </div>
          </div>

          <!-- Receiver's Address -->
          <div class="address-section" style="margin-bottom: ${pageSize === 'A5' ? '15px' : '20px'}; padding: ${pageSize === 'A5' ? '10px' : '15px'}; background-color: #f9f9f9; border-left: 3px solid #4CAF50;">
            <div style="font-weight: bold; margin-bottom: ${pageSize === 'A5' ? '8px' : '10px'}; font-size: ${pageSize === 'A5' ? '12px' : '14px'};">To : RECEIVER'S ADDRESS</div>
            <div style="font-size: ${pageSize === 'A5' ? '11px' : '13px'}; line-height: 1.6;">
              <strong>${order.customer}</strong><br>
              ${order.address}<br>
              ${order.city}, OMAN<br>
              <strong>Ph:</strong> ${order.phone}
            </div>
          </div>

          <!-- Shipper's Address -->
          <div class="address-section" style="margin-bottom: ${pageSize === 'A5' ? '15px' : '20px'}; padding: ${pageSize === 'A5' ? '10px' : '15px'}; background-color: #f9f9f9; border-left: 3px solid #2196F3;">
            <div style="font-weight: bold; margin-bottom: ${pageSize === 'A5' ? '8px' : '10px'}; font-size: ${pageSize === 'A5' ? '12px' : '14px'};">From : SHIPPER'S ADDRESS</div>
            <div style="font-size: ${pageSize === 'A5' ? '11px' : '13px'}; line-height: 1.6;">
              <strong>Qeelu Store</strong><br>
              Mabela, Muscat, OMAN<br>
              <strong>Ph:</strong> +968 XXXXXXXX
            </div>
          </div>

          <!-- Order Details -->
          <div class="details-section" style="margin-bottom: ${pageSize === 'A5' ? '15px' : '20px'};">
            <div style="font-weight: bold; margin-bottom: ${pageSize === 'A5' ? '8px' : '10px'}; font-size: ${pageSize === 'A5' ? '12px' : '14px'}; border-bottom: 1px solid #ddd; padding-bottom: 5px;">ORDER DETAILS</div>
            <div style="font-size: ${pageSize === 'A5' ? '11px' : '13px'}; line-height: 1.8;">
              <div style="margin-bottom: ${pageSize === 'A5' ? '8px' : '10px'};">
                <strong>Products:</strong><br>
                <div style="margin-left: ${pageSize === 'A5' ? '10px' : '15px'}; margin-top: 5px;">
                  ${productsList}
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: ${pageSize === 'A5' ? '10px' : '15px'}; padding-top: ${pageSize === 'A5' ? '10px' : '15px'}; border-top: 2px solid #000;">
                <div>
                  <div><strong>Total Items:</strong> ${order.products.reduce((sum, p) => sum + p.quantity, 0)}</div>
                  <div style="margin-top: 5px;"><strong>Status:</strong> ${order.status.toUpperCase()}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: ${pageSize === 'A5' ? '14px' : '18px'}; font-weight: bold; color: #4CAF50;">
                    <strong>Total: ${order.total.toFixed(2)} OMR</strong>
                  </div>
                  <div style="font-size: ${pageSize === 'A5' ? '10px' : '12px'}; color: #666; margin-top: 5px;">
                    Amount to Collect: ${order.total.toFixed(2)} OMR
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: ${pageSize === 'A5' ? '15px' : '20px'}; padding-top: ${pageSize === 'A5' ? '10px' : '15px'}; border-top: 1px solid #ddd; font-size: ${pageSize === 'A5' ? '9px' : '11px'}; color: #666; text-align: center;">
            <div>Thank you for your order!</div>
            <div style="margin-top: 5px;">For tracking, visit: www.qeelu.com</div>
          </div>
        </div>
      `;
    }).join('');

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to print', 'error');
      return;
    }

    const pageSizeCSS = pageSize === 'A5' ? 'A5' : 'A4';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Orders - Qeelu Store</title>
          <style>
            @media print {
              @page {
                size: ${pageSizeCSS};
                margin: ${pageSize === 'A5' ? '8mm' : '10mm'};
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: ${pageSize === 'A5' ? '15px' : '20px'};
            }
            .order-page {
              ${pageSize === 'A5' ? 'font-size: 11px;' : ''}
            }
            .order-page h2 {
              ${pageSize === 'A5' ? 'font-size: 18px;' : 'font-size: 24px;'}
            }
            .order-page .header {
              ${pageSize === 'A5' ? 'padding: 10px; margin-bottom: 15px;' : 'padding: 20px; margin-bottom: 20px;'}
            }
            .order-page .address-section {
              ${pageSize === 'A5' ? 'padding: 10px; margin-bottom: 15px; font-size: 11px;' : 'padding: 15px; margin-bottom: 20px;'}
            }
            .order-page .details-section {
              ${pageSize === 'A5' ? 'padding: 10px; font-size: 11px;' : 'padding: 15px;'}
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Optionally close the window after printing
      // printWindow.close();
    }, 250);
  };

  const handlePrintSelected = (pageSize: 'A4' | 'A5' = 'A4') => {
    const ordersToPrint = orders.filter(o => selectedOrders.includes(o.id));
    printOrders(ordersToPrint, pageSize);
  };

  const handlePrintAll = (pageSize: 'A4' | 'A5' = 'A4') => {
    printOrders(filteredOrders, pageSize);
  };

  // Import from Excel function
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show loading toast
    showToast('Processing Excel file...', 'success');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Skip first row (header) by using range option
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', // Default value for empty cells
        raw: false   // Convert all to strings first
      });

      console.log(`📊 Total rows in Excel: ${jsonData.length}`);

      // Transform Excel data to order format
      const ordersToImport = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as Record<string, string | number>;
        const rowNum = i + 2; // Excel row number (accounting for header)

        // Validate required fields - convert to string
        const customer = String(row['Customer'] || row['customer'] || '');
        const phone = String(row['Phone'] || row['phone'] || '');
        const city = String(row['City'] || row['city'] || '');
        const address = String(row['Address'] || row['address'] || '');
        const productName = String(row['Product'] || row['Products'] || row['product'] || '');
        const quantity = parseInt(String(row['Quantity'] || row['quantity'] || '1'));
        const price = parseFloat(String(row['Price'] || row['price'] || '0'));
        const total = parseFloat(String(row['Total'] || row['total'] || (price * quantity).toString()));

        // Check required fields
        if (!customer.trim()) {
          errors.push(`Row ${rowNum}: Customer name missing`);
          continue;
        }
        if (!phone.trim()) {
          errors.push(`Row ${rowNum}: Phone number missing`);
          continue;
        }
        if (!city.trim()) {
          errors.push(`Row ${rowNum}: City missing`);
          continue;
        }
        if (!address.trim()) {
          errors.push(`Row ${rowNum}: Address missing`);
          continue;
        }
        if (!productName.trim()) {
          errors.push(`Row ${rowNum}: Product name missing`);
          continue;
        }

        ordersToImport.push({
          customer: customer.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          products: [{
            name: productName.trim(),
            quantity: quantity || 1,
            price: price || 0,
          }],
          total: total || 0,
        });
      }

      console.log(`✅ Valid orders: ${ordersToImport.length}`);
      console.log(`❌ Errors: ${errors.length}`);

      if (ordersToImport.length === 0) {
        showToast(`No valid orders found. ${errors.length} errors.`, 'error');
        console.error('Import errors:', errors);
        return;
      }

      // Send to API
      const response = await fetch('/api/orders/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: ordersToImport }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.failed > 0) {
          showToast(
            `Imported ${result.imported} orders. ${result.failed} failed.`, 
            'error'
          );
          console.error('Import errors:', result.errors);
        } else {
          showToast(
            `✅ Successfully imported ${result.imported} orders! All set to Pending status.`, 
            'success'
          );
        }
        
        // Refresh page to show new orders
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const errorData = await response.json();
        showToast(`Import failed: ${errorData.error}`, 'error');
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error importing Excel:', error);
      showToast(`Error: ${error instanceof Error ? error.message : 'Failed to read Excel file'}`, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div>
      {/* Page Title with Export Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a2e' }}>
            {t('admin.orders.title')}
          </h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            {t('admin.orders.subtitle')}
          </p>
        </div>

        {/* Export/Import/Print Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Export Dropdown */}
          <div style={{ position: 'relative' }} id="export-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('export-dropdown');
                if (dropdown) {
                  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
              }}
              disabled={filteredOrders.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '2px solid #1a1a2e',
                backgroundColor: '#fff',
                color: '#1a1a2e',
                fontSize: '14px',
                fontWeight: '600',
                cursor: filteredOrders.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredOrders.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-gray-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Export
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id="export-dropdown"
              style={{
                display: 'none',
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                zIndex: 1000,
                minWidth: '200px',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedOrders.length > 0 && (
                <button
                  onClick={() => {
                    handleExportSelected();
                    const dropdown = document.getElementById('export-dropdown');
                    if (dropdown) dropdown.style.display = 'none';
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#1a1a2e',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  className="hover:bg-gray-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('admin.orders.export.selected')} ({selectedOrders.length})
                </button>
              )}
              <button
                onClick={() => {
                  handleExportAll();
                  const dropdown = document.getElementById('export-dropdown');
                  if (dropdown) dropdown.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1a1a2e',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                className="hover:bg-gray-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Export All {filterStatus !== 'all' ? `(${t(`admin.orders.statuses.${filterStatus}`)})` : ''}
              </button>
            </div>
          </div>

          {/* Print Dropdown */}
          <div style={{ position: 'relative' }} id="print-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('print-dropdown');
                if (dropdown) {
                  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
              }}
              disabled={filteredOrders.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '2px solid #FF9800',
                backgroundColor: '#fff',
                color: '#FF9800',
                fontSize: '14px',
                fontWeight: '600',
                cursor: filteredOrders.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredOrders.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-orange-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <polyline points="6 14 12 20 18 14" />
              </svg>
              Print
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              id="print-dropdown"
              style={{
                display: 'none',
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                zIndex: 1000,
                minWidth: '220px',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedOrders.length > 0 && (
                <>
                  <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0' }}>
                    Print Selected ({selectedOrders.length})
                  </div>
                  <button
                    onClick={() => {
                      handlePrintSelected('A4');
                      const dropdown = document.getElementById('print-dropdown');
                      if (dropdown) dropdown.style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#1a1a2e',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s ease',
                    }}
                    className="hover:bg-gray-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    Print Selected - A4
                  </button>
                  <button
                    onClick={() => {
                      handlePrintSelected('A5');
                      const dropdown = document.getElementById('print-dropdown');
                      if (dropdown) dropdown.style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#1a1a2e',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s ease',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                    className="hover:bg-gray-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    Print Selected - A5
                  </button>
                </>
              )}
              <div style={{ padding: '8px 16px', fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', borderTop: selectedOrders.length > 0 ? '1px solid #f0f0f0' : 'none', borderBottom: '1px solid #f0f0f0' }}>
                Print All {filterStatus !== 'all' ? `(${t(`admin.orders.statuses.${filterStatus}`)})` : ''}
              </div>
              <button
                onClick={() => {
                  handlePrintAll('A4');
                  const dropdown = document.getElementById('print-dropdown');
                  if (dropdown) dropdown.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1a1a2e',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                className="hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <polyline points="6 14 12 20 18 14" />
                </svg>
                Print All - A4
              </button>
              <button
                onClick={() => {
                  handlePrintAll('A5');
                  const dropdown = document.getElementById('print-dropdown');
                  if (dropdown) dropdown.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#1a1a2e',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                className="hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <polyline points="6 14 12 20 18 14" />
                </svg>
                Print All - A5
              </button>
            </div>
          </div>
          
          {/* Import Button */}
          <div>
            <input
              type="file"
              id="import-excel"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => document.getElementById('import-excel')?.click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '2px solid #2196F3',
                backgroundColor: '#fff',
                color: '#2196F3',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="hover:bg-blue-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {t('admin.orders.import', { defaultValue: 'Import Excel' })}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7"
        style={{ gap: '12px', marginBottom: '20px' }}
      >
        {/* Total Orders */}
        <div style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '6px' }}>{t('admin.orders.stats.total')}</p>
          <p style={{ fontSize: '26px', fontWeight: '700' }}>{stats.total}</p>
        </div>

        {/* Revenue */}
        <div style={{
          backgroundColor: '#00BCD4',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>{t('admin.orders.stats.revenue')}</p>
          <p style={{ fontSize: '22px', fontWeight: '700' }}>{stats.revenue.toFixed(2)} OMR</p>
        </div>

        {/* Pending */}
        <div style={{
          backgroundColor: '#FF9800',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>⏳</span>
            <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{t('admin.orders.statuses.pending')}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.pending}</p>
        </div>

        {/* Processing */}
        <div style={{
          backgroundColor: '#2196F3',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>⚙️</span>
            <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{t('admin.orders.statuses.processing')}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.processing}</p>
        </div>

        {/* Shipped */}
        <div style={{
          backgroundColor: '#9C27B0',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>🚚</span>
            <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{t('admin.orders.statuses.shipped')}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.shipped}</p>
        </div>

        {/* Delivered */}
        <div style={{
          backgroundColor: '#4CAF50',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{t('admin.orders.statuses.delivered')}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.delivered}</p>
        </div>

        {/* Cancelled */}
        <div style={{
          backgroundColor: '#f44336',
          borderRadius: '14px',
          padding: '16px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>❌</span>
            <p style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>{t('admin.orders.statuses.cancelled')}</p>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div className="flex flex-col md:flex-row" style={{ gap: '12px' }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={t('admin.orders.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 42px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#333',
                backgroundColor: '#f8f9fa',
              }}
            />
          </div>

          {/* Items Per Page Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', whiteSpace: 'nowrap' }}>
              Items per page:
            </label>
            <select
              value={ordersPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              style={{
                padding: '10px 14px',
                paddingRight: '36px',
                borderRadius: '10px',
                border: '1.5px solid #e0e0e0',
                backgroundColor: '#fff',
                color: '#1a1a2e',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const isSelected = filterStatus === status;
              const statusColor = status !== 'all' ? statusConfig[status as OrderStatus]?.color : '#1a1a2e';
              
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: isSelected ? `2px solid ${statusColor}` : '2px solid transparent',
                    backgroundColor: isSelected ? statusColor : `${statusColor}15`,
                    color: isSelected ? '#fff' : statusColor,
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 4px 12px ${statusColor}40` : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                  className="hover:opacity-90"
                >
                  {status === 'all' ? t('admin.orders.all') : t(`admin.orders.statuses.${status}`)}
                </button>
              );
            })}
            
            {/* Bulk Status Change - Show when orders are selected AND not viewing 'all' */}
            {selectedOrders.length > 0 && filterStatus !== 'all' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginLeft: 'auto',
                padding: '6px 10px',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                border: '1px solid #FF9800'
              }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#E65100' }}>
                  {selectedOrders.length}
                </span>
                <select
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    if (newStatus && window.confirm(`Change ${selectedOrders.length} orders to ${newStatus}?`)) {
                      handleBulkStatusChange(newStatus);
                    }
                    e.target.value = '';
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #FF9800',
                    backgroundColor: '#fff',
                    color: '#E65100',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Status →</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="processing">⚙️ Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Desktop Table */}
        <div className="hidden lg:block" style={{ overflowX: 'auto', overflowY: 'visible', position: 'relative' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'center', padding: '16px', width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#4CAF50',
                    }}
                  />
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.orderId')}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.customer')}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.products')}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.total')}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.status')}
                </th>
                <th style={{ textAlign: 'left', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.date')}
                </th>
                <th style={{ textAlign: 'center', padding: '16px', color: '#666', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  {t('admin.orders.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }} className="hover:bg-gray-50">
                  <td style={{ textAlign: 'center', padding: '16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#4CAF50',
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Product Images */}
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {order.products.slice(0, 3).map((product, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              position: 'relative',
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            <Image
                              src={getProductImage(product.name)}
                              alt={product.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              unoptimized
                            />
                          </div>
                        ))}
                        {order.products.length > 3 && (
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #e0e0e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#999',
                              fontWeight: '600',
                            }}
                          >
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>
                      {/* Order ID and Date */}
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                          #{order.id}
                        </p>
                        <p style={{ fontSize: '12px', color: '#999' }}>{order.date}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>{order.customer}</p>
                      <p style={{ fontSize: '12px', color: '#999' }}>{order.city}</p>
                      <p style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{order.phone}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {order.products.slice(0, 2).map((product, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                          </span>
                          <span style={{ fontSize: '11px', color: '#999' }}>x{product.quantity}</span>
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <p style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                          +{order.products.length - 2} more
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>
                      {order.total.toFixed(2)} OMR
                    </p>
                  </td>
                  <td style={{ padding: '16px', position: 'relative', overflow: 'visible' }}>
                    <div style={{ position: 'relative', zIndex: openStatusDropdown === order.id ? 1001 : 'auto' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStatusDropdown(openStatusDropdown === order.id ? null : order.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: statusConfig[order.status as OrderStatus]?.bgColor,
                          color: statusConfig[order.status as OrderStatus]?.color,
                          border: `1px solid ${statusConfig[order.status as OrderStatus]?.color}20`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        className="hover:opacity-80"
                      >
                        <span style={{ fontSize: '14px' }}>{statusConfig[order.status as OrderStatus]?.icon}</span>
                        {t(`admin.orders.statuses.${order.status}`)}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openStatusDropdown === order.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '4px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            border: '1px solid #e0e0e0',
                            zIndex: 1002,
                            minWidth: '200px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                          }}
                        >
                          {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateStatus(order.id, status)}
                              disabled={order.status === status}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                border: 'none',
                                backgroundColor: order.status === status ? statusConfig[status]?.bgColor : 'transparent',
                                color: order.status === status ? statusConfig[status]?.color : '#333',
                                fontSize: '13px',
                                fontWeight: order.status === status ? '600' : '400',
                                cursor: order.status === status ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                              }}
                              className={order.status !== status ? 'hover:bg-gray-50' : ''}
                            >
                              <span style={{ fontSize: '14px' }}>{statusConfig[status]?.icon}</span>
                              {t(`admin.orders.statuses.${status}`)}
                              {order.status === status && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>{order.date}</p>
                      <p style={{ fontSize: '12px', color: '#999' }}>{order.time}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        onClick={() => handleViewOrder(order)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#e3f2fd',
                          color: '#2196F3',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        className="hover:opacity-90"
                        title={t('admin.orders.view')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#fff3e0',
                          color: '#FF9800',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        className="hover:opacity-90"
                        title={t('admin.orders.edit')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#ffebee',
                          color: '#e53935',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        className="hover:opacity-90"
                        title={t('admin.orders.delete')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden">
          {/* Select All for Mobile */}
          {filteredOrders.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderBottom: '2px solid #e0e0e0',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <input
                type="checkbox"
                checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                onChange={handleSelectAll}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#4CAF50',
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>
                {t('admin.orders.selectAll')} ({filteredOrders.length})
              </span>
            </div>
          )}
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selectedOrders.includes(order.id) ? '#f0f9ff' : '#fff',
                transition: 'background-color 0.2s ease',
              }}
            >
              {/* Header with Order ID and Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#4CAF50',
                      flexShrink: 0,
                    }}
                  />
                  {/* Product Images */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {order.products.slice(0, 2).map((product, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <Image
                          src={getProductImage(product.name)}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      </div>
                    ))}
                    {order.products.length > 2 && (
                      <div
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '8px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          color: '#999',
                          fontWeight: '600',
                        }}
                      >
                        +{order.products.length - 2}
                      </div>
                    )}
                  </div>
                  {/* Order ID and Date */}
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>#{order.id}</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{order.date} • {order.time}</p>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: openStatusDropdown === order.id ? 1001 : 'auto' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStatusDropdown(openStatusDropdown === order.id ? null : order.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: statusConfig[order.status as OrderStatus]?.bgColor,
                      color: statusConfig[order.status as OrderStatus]?.color,
                      border: `1px solid ${statusConfig[order.status as OrderStatus]?.color}20`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="hover:opacity-80"
                  >
                    <span style={{ fontSize: '12px' }}>{statusConfig[order.status as OrderStatus]?.icon}</span>
                    {t(`admin.orders.statuses.${order.status}`)}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '2px' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu for Mobile */}
                  {openStatusDropdown === order.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        border: '1px solid #e0e0e0',
                        zIndex: 1002,
                        minWidth: '180px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                      }}
                    >
                      {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(order.id, status)}
                          disabled={order.status === status}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 12px',
                            border: 'none',
                            backgroundColor: order.status === status ? statusConfig[status]?.bgColor : 'transparent',
                            color: order.status === status ? statusConfig[status]?.color : '#333',
                            fontSize: '12px',
                            fontWeight: order.status === status ? '600' : '400',
                            cursor: order.status === status ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                          }}
                          className={order.status !== status ? 'hover:bg-gray-50' : ''}
                        >
                          <span style={{ fontSize: '12px' }}>{statusConfig[status]?.icon}</span>
                          {t(`admin.orders.statuses.${status}`)}
                          {order.status === status && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                marginBottom: '12px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1a1a2e',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '10px',
                }}>
                  {order.customer.charAt(0)}
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                  {order.customer}
                </p>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>{order.city}</p>
                <p style={{ fontSize: '11px', color: '#bbb' }}>{order.phone}</p>
              </div>

              {/* Products List */}
              <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
                {order.products.slice(0, 2).map((product, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666', flex: 1 }}>
                      {product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                      x{product.quantity}
                    </span>
                  </div>
                ))}
                {order.products.length > 2 && (
                  <p style={{ fontSize: '11px', color: '#999', fontStyle: 'italic', marginTop: '4px' }}>
                    +{order.products.length - 2} more items
                  </p>
                )}
              </div>

              {/* Footer with Total and Buttons */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (order.status === 'cancelled' && filterStatus === 'cancelled') ? '10px' : '0' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>Total</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: '#4CAF50' }}>{order.total.toFixed(2)} OMR</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewOrder(order)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#e3f2fd',
                        color: '#2196F3',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="hover:opacity-90"
                      title={t('admin.orders.view')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#fff3e0',
                        color: '#FF9800',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="hover:opacity-90"
                      title={t('admin.orders.edit')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#ffebee',
                        color: '#e53935',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="hover:opacity-90"
                      title={t('admin.orders.delete')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>📦</p>
            <p style={{ fontSize: '16px', color: '#999' }}>{t('admin.orders.noOrders')}</p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
            padding: '20px',
            flexWrap: 'wrap',
          }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                color: currentPage === 1 ? '#999' : '#1a1a2e',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className={currentPage !== 1 ? 'hover:bg-gray-50' : ''}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                // Show first page, last page, current page, and pages around current
                const showPage = pageNum === 1 || 
                                pageNum === totalPages || 
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                
                // Show ellipsis
                const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={`ellipsis-${pageNum}`} style={{ 
                      padding: '10px 8px', 
                      color: '#999',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}>
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: currentPage === pageNum ? '2px solid #1a1a2e' : '2px solid #e0e0e0',
                      backgroundColor: currentPage === pageNum ? '#1a1a2e' : '#fff',
                      color: currentPage === pageNum ? '#fff' : '#333',
                      fontSize: '14px',
                      fontWeight: currentPage === pageNum ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: '44px',
                      boxShadow: currentPage === pageNum ? '0 4px 12px rgba(26, 26, 46, 0.3)' : 'none',
                      transform: currentPage === pageNum ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                    className="hover:bg-gray-50"
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                color: currentPage === totalPages ? '#999' : '#1a1a2e',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className={currentPage !== totalPages ? 'hover:bg-gray-50' : ''}
            >
              <span className="hidden sm:inline">Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Page Info */}
            <div style={{
              marginLeft: '12px',
              padding: '10px 16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#666',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}>
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        order={editingOrder}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
      />
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}

