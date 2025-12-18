'use client';

import { useState, use, useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import { cities, getCityName } from '@/data/products';
import { notFound } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useProducts } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';
import { saveAbandonedOrder, removeAbandonedOrderOnSubmit } from '@/utils/abandonedOrders';
import { getProductTitle, getProductDescription, getProductFeatures } from '@/utils/getProductText';
import { getSoldCount } from '@/utils/getSoldCount';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const { products, loading } = useProducts();
  const { addOrder, orders } = useOrders();
  // Handle both integer IDs (from initial data) and decimal IDs (from new products)
  const product = products.find(p => {
    // Convert both to numbers and compare
    const productId = Number(p.id);
    const searchId = Number(id);
    // Use strict equality for exact match (works for both integers and decimals)
    return productId === searchId;
  });
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Load saved customer details from sessionStorage (clears on page refresh/close)
  const loadSavedCustomerDetails = () => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('qeelu_customer_details');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  // Load recent orders from sessionStorage (clears on page refresh/close)
  const loadRecentOrders = () => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem('qeelu_recent_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [recentOrders, setRecentOrders] = useState(() => loadRecentOrders());

  const [formData, setFormData] = useState(() => {
    const savedDetails = loadSavedCustomerDetails();
    return savedDetails || {
      fullName: '',
      mobile: '',
      quantity: '1',
      city: '',
      address: ''
    };
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false); // Track if form was submitted
  const formDataRef = useRef(formData); // Keep ref for cleanup handlers
  const savedDetailsRef = useRef(loadSavedCustomerDetails());

  // Get all available images (before early returns)
  const allImages = product ? (product.images || [product.image]) : [];
  const totalImages = allImages.length;

  // Update formDataRef when formData changes (MUST be before early returns)
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Auto-slide images every 3 seconds (MUST be before early returns)
  useEffect(() => {
    if (!product || totalImages <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage(prev => (prev + 1) % totalImages);
    }, 3000);

    return () => clearInterval(interval);
  }, [totalImages, product]);

  // Save abandoned order when user leaves page (MUST be before early returns)
  useEffect(() => {
    if (!product) return;

    const shouldSaveAbandoned = () => {
      if (hasSubmittedRef.current) return false;
      if (!formDataRef.current.fullName || !formDataRef.current.mobile) return false;
      
      const saved = savedDetailsRef.current;
      if (saved) {
        const hasChanges = 
          formDataRef.current.fullName !== saved.fullName ||
          formDataRef.current.mobile !== saved.mobile ||
          formDataRef.current.city !== saved.city ||
          formDataRef.current.address !== saved.address;
        return hasChanges;
      }
      return true;
    };
    
    const handleBeforeUnload = () => {
      if (shouldSaveAbandoned()) {
        saveAbandonedOrder({
          name: formDataRef.current.fullName,
          phone: formDataRef.current.mobile,
          city: formDataRef.current.city,
          address: formDataRef.current.address,
          quantity: formDataRef.current.quantity,
          product_id: product.id.toString(),
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && shouldSaveAbandoned()) {
        saveAbandonedOrder({
          name: formDataRef.current.fullName,
          phone: formDataRef.current.mobile,
          city: formDataRef.current.city,
          address: formDataRef.current.address,
          quantity: formDataRef.current.quantity,
          product_id: product.id.toString(),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (shouldSaveAbandoned()) {
        saveAbandonedOrder({
          name: formDataRef.current.fullName,
          phone: formDataRef.current.mobile,
          city: formDataRef.current.city,
          address: formDataRef.current.address,
          quantity: formDataRef.current.quantity,
          product_id: product.id.toString(),
        });
      }
    };
  }, [product]);

  // Show loading state while products are being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#eeeeee' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #4CAF50',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#666', fontSize: '16px' }}>Loading product...</p>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // After loading, if product not found, show 404
  if (!product) {
    notFound();
  }

  // Handle manual image selection
  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: typeof formData) => {
      const updated = { ...prev, [name]: value };
      formDataRef.current = updated; // Update ref
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.mobile || !formData.city || !formData.address) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    // Mark as submitted to prevent saving as abandoned
    hasSubmittedRef.current = true;

    const quantity = parseInt(formData.quantity);
    
    // Calculate price based on pricing tiers or default
    const totalPrice = product.pricingTiers && product.pricingTiers.length > 0
      ? (product.pricingTiers.find(t => t.quantity === quantity)?.price || product.currentPrice * quantity)
      : product.currentPrice * quantity;

    // Remove abandoned order if exists (user successfully submitted)
    await removeAbandonedOrderOnSubmit(formData.mobile, formData.fullName);

    // Check if customer details were edited (new customer)
    const saved = savedDetailsRef.current;
    const isNewCustomer = saved ? (
      formData.fullName !== saved.fullName ||
      formData.mobile !== saved.mobile ||
      formData.city !== saved.city ||
      formData.address !== saved.address
    ) : false;

    // If details changed, clear old orders (new customer)
    if (isNewCustomer) {
      try {
        sessionStorage.removeItem('qeelu_recent_orders');
        setRecentOrders([]);
      } catch (error) {
        console.error('Error clearing old orders:', error);
      }
    }

    // Save customer details to sessionStorage (clears on page refresh/close)
    try {
      sessionStorage.setItem('qeelu_customer_details', JSON.stringify({
        fullName: formData.fullName,
        mobile: formData.mobile,
        city: formData.city,
        address: formData.address,
        quantity: '1', // Always reset quantity
      }));
      // Update saved ref for next comparison
      savedDetailsRef.current = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        city: formData.city,
        address: formData.address,
        quantity: '1',
      };
    } catch (error) {
      console.error('Error saving customer details:', error);
    }

    // Create order object
    const newOrder = {
      id: `ORD-${Date.now()}`,
      customer: formData.fullName,
      phone: formData.mobile,
      city: formData.city,
      address: formData.address,
      product: {
        name: getProductTitle(product, isArabic ? 'ar' : 'en'),
        image: product.image,
        quantity: quantity,
        price: product.currentPrice,
      },
      total: totalPrice,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add order to context
    addOrder({
      customer: formData.fullName,
      phone: formData.mobile,
      city: formData.city,
      address: formData.address,
      products: [{
        name: getProductTitle(product, isArabic ? 'ar' : 'en'),
        quantity: quantity,
        price: product.currentPrice,
      }],
      total: totalPrice,
      status: 'pending',
    });

    // Save to recent orders (keep last 5 orders) in sessionStorage
    try {
      const existingOrders = isNewCustomer ? [] : loadRecentOrders();
      const updatedOrders = [newOrder, ...existingOrders].slice(0, 5);
      sessionStorage.setItem('qeelu_recent_orders', JSON.stringify(updatedOrders));
      setRecentOrders(updatedOrders);
    } catch (error) {
      console.error('Error saving recent orders:', error);
    }

    // Show success message and scroll to top
    setOrderSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset only quantity, keep customer details for next order        
    setFormData((prev: typeof formData) => ({
      ...prev,
      quantity: '1'
    }));
    formDataRef.current = {
      ...formDataRef.current,
      quantity: '1'
    };
  };

  // Get translated title, description, and features based on current language
  // These will update automatically when language changes
  const productTitle = getProductTitle(product, isArabic ? 'ar' : 'en');
  const productDescription = getProductDescription(product, isArabic ? 'ar' : 'en');
  const productFeatures = getProductFeatures(product, isArabic ? 'ar' : 'en');

  // Get recommended products (same category, different product)
  const getRecommendedProducts = () => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id && p.status !== 'inactive')
      .slice(0, 4);
  };
  
  // Calculate actual sold count from orders
  const actualSoldCount = getSoldCount(product, orders);

  // Generate quantity options from pricing tiers or default
  // Debug: Log pricing tiers
  console.log('Product ID:', product.id);
  console.log('Product pricingTiers:', product.pricingTiers);
  console.log('Tiers length:', product.pricingTiers?.length || 0);
  
  const quantityOptions = product.pricingTiers && product.pricingTiers.length > 0
    ? product.pricingTiers.map(tier => ({
        value: tier.quantity.toString(),
        label: `${tier.quantity} ${tier.quantity === 1 ? t('orderForm.piece') : t('orderForm.pieces')} - ${tier.price.toFixed(2)} OMR`
      }))
    : [
        { value: '1', label: `1 ${t('orderForm.piece')} - ${product.currentPrice.toFixed(2)} OMR` },
        { value: '2', label: `2 ${t('orderForm.pieces')} - ${(product.currentPrice * 2).toFixed(2)} OMR` },
        { value: '3', label: `3 ${t('orderForm.pieces')} - ${(product.currentPrice * 3).toFixed(2)} OMR` },
      ];
  
  console.log('Generated quantityOptions:', quantityOptions);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#eeeeee' }}>
      <Header />
      
      <main className="flex-1" style={{ paddingTop: '20px', paddingBottom: '30px' }}>
        {/* Centered Container */}
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            paddingLeft: '20px',
            paddingRight: '20px'
          }}
        >
          {/* Product Title */}
          <h1 style={{ fontSize: isArabic ? '20px' : '17px', fontWeight: '500', color: '#222', marginBottom: '16px' }}>
            {productTitle} - <span style={{ color: '#4CAF50' }}>{t('product.freeDelivery')}</span>
          </h1>

          {/* Order Confirmation Success */}
          {orderSubmitted && (
            <div style={{ marginBottom: '24px' }}>
              {/* Success Card - Compact */}
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '24px',
              }}>
                {/* Success Icon - Smaller */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                {/* Success Message - Compact */}
                <h2 style={{
                  fontSize: isArabic ? '22px' : '20px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '8px',
                }}>
                  {isArabic ? 'تم إرسال طلبك بنجاح!' : 'Order Placed Successfully!'}
                </h2>
                <p style={{
                  fontSize: isArabic ? '14px' : '13px',
                  color: '#666',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}>
                  {isArabic 
                    ? 'شكراً لك! سنتواصل معك قريباً للتوصيل خلال 1-2 يوم عمل.'
                    : 'Thank you! We will contact you for delivery within 1-2 working days.'}
                </p>

                {/* Order Summary - Compact */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginTop: '16px',
                  textAlign: 'left',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>{isArabic ? 'المنتج:' : 'Product:'}</span>
                      <span style={{ fontWeight: '500', color: '#1a1a2e', fontSize: '12px', maxWidth: '60%', textAlign: 'right' }}>
                        {productTitle.length > 40 ? productTitle.substring(0, 40) + '...' : productTitle}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>{isArabic ? 'الكمية:' : 'Qty:'}</span>
                      <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{formData.quantity || '1'}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1.5px solid #e0e0e0',
                      marginTop: '4px',
                    }}>
                      <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#4CAF50' }}>
                        {(product.currentPrice * parseInt(formData.quantity || '1')).toFixed(2)} OMR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '16px',
                  flexWrap: 'wrap',
                  justifyContent: 'center' 
                }}>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      flex: '1',
                      minWidth: '140px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    className="hover:opacity-90"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                  </button>
                  <button
                    onClick={() => {
                      // Redirect to home page to select another product
                      window.location.href = '/';
                    }}
                    style={{
                      flex: '1',
                      minWidth: '140px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '2px solid #FF9800',
                      backgroundColor: '#fff',
                      color: '#FF9800',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    className="hover:bg-orange-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    {isArabic ? 'تسوق منتجات أخرى' : 'Shop More Products'}
                  </button>
                </div>
              </div>

              {/* Recent Orders Section - Only show if 2 or more orders (not first order) */}
              {recentOrders.length > 1 && (
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: isArabic ? '20px' : '18px',
                      fontWeight: '700',
                      color: '#1a1a2e',
                      margin: 0,
                    }}>
                      {isArabic ? 'طلباتك الأخيرة' : 'Your Recent Orders'}
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm(isArabic ? 'هل تريد حذف سجل الطلبات؟' : 'Clear order history?')) {
                          sessionStorage.removeItem('qeelu_recent_orders');
                          sessionStorage.removeItem('qeelu_customer_details');
                          setRecentOrders([]);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#fff',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      {isArabic ? 'حذف السجل' : 'Clear History'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentOrders.slice(0, 3).map((order: {id: string; product: {name: string; image: string; quantity: number; price: number}; date: string; time: string; total: number}, index: number) => (
                      <div
                        key={order.id}
                        style={{
                          backgroundColor: index === 0 ? '#e8f5e9' : '#fff',
                          border: index === 0 ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          boxShadow: index === 0 ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        {/* Order Number Badge */}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: index === 0 ? '#4CAF50' : '#f5f5f5',
                          color: index === 0 ? '#fff' : '#666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </div>

                        {/* Product Image */}
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                        }}>
                          <Image
                            src={order.product.image}
                            alt={order.product.name}
                            fill
                            className="object-cover"
                            sizes="50px"
                          />
                        </div>

                        {/* Order Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1a1a2e',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {order.product.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#666' }}>
                            {isArabic ? 'الكمية:' : 'Qty:'} {order.product.quantity} • {order.product.price.toFixed(2)} OMR
                          </p>
                        </div>

                        {/* Total */}
                        <div style={{
                          textAlign: 'right',
                          flexShrink: 0,
                        }}>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>
                            {order.total.toFixed(2)} OMR
                          </p>
                          <p style={{ fontSize: '11px', color: '#999' }}>
                            {order.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Products Section */}
              <div>
                <h3 style={{
                  fontSize: isArabic ? '20px' : '18px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  {isArabic ? 'منتجات قد تعجبك' : 'You May Also Like'}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
                  {getRecommendedProducts().map((recommendedProduct) => {
                    const recTitle = getProductTitle(recommendedProduct, isArabic ? 'ar' : 'en');
                    return (
                      <a
                        key={recommendedProduct.id}
                        href={`/product/${recommendedProduct.id}`}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                        }}
                        className="hover:shadow-lg"
                      >
                        {/* Product Image */}
                        <div style={{
                          position: 'relative',
                          paddingBottom: '100%',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginBottom: '10px',
                        }}>
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 10,
                            backgroundColor: '#e53935',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}>
                            {recommendedProduct.discount}% OFF
                          </span>
                          <Image
                            src={recommendedProduct.image}
                            alt={recTitle}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {recommendedProduct.freeDelivery && (
                            <span style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              zIndex: 10,
                              backgroundColor: '#4CAF50',
                              color: '#fff',
                              fontSize: '9px',
                              fontWeight: '500',
                              padding: '3px 6px',
                              borderRadius: '50px',
                            }}>
                              {t('product.freeDelivery')}
                            </span>
                          )}
                        </div>

                        {/* Product Info */}
                        <div>
                          <h4 style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#1a1a2e',
                            marginBottom: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '36px',
                          }}>
                            {recTitle}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              color: '#e53935',
                              fontSize: '16px',
                              fontWeight: '700',
                            }}>
                              {recommendedProduct.currentPrice.toFixed(2)} OMR
                            </span>
                            <span style={{
                              color: '#999',
                              fontSize: '12px',
                              textDecoration: 'line-through',
                            }}>
                              {recommendedProduct.originalPrice.toFixed(2)} OMR
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          {!orderSubmitted && (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '20px' }}>
            
            {/* Left Column - Product Images & Info */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '14px',
                boxShadow: '0px 1px 4px rgba(0,0,0,0.08)'
              }}
            >
              {/* Main Image */}
              <div 
                className="relative"
                style={{ 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  paddingBottom: '100%',
                  backgroundColor: '#f8f8f8'
                }}
              >
                <span 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                    backgroundColor: '#e53935',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {product.discount}% {t('product.off')}
                </span>
                <Image
                  src={allImages[selectedImage]}
                  alt={productTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ transition: 'opacity 0.5s ease' }}
                />

                {/* Navigation Arrows - only show if multiple images */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={() => handleImageSelect((selectedImage - 1 + totalImages) % totalImages)}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-white"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageSelect((selectedImage + 1) % totalImages)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-white"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}

                {product.freeDelivery && (
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      zIndex: 10,
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '500',
                      padding: '3px 8px',
                      borderRadius: '50px'
                    }}
                  >
                    {t('product.freeDelivery')}
                  </span>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex justify-center" style={{ gap: '6px', marginTop: '12px' }}>
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '6px',
                      border: selectedImage === index ? '2px solid #009688' : '2px solid #e0e0e0',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${productTitle} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Slider Indicators */}
              {totalImages > 1 && (
                <div className="flex justify-center" style={{ gap: '8px', marginTop: '12px' }}>
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      style={{
                        width: selectedImage === index ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: selectedImage === index ? '#009688' : '#e0e0e0',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Price & Sold Count - OMR */}
              <div className="flex items-center justify-between" style={{ marginTop: '14px' }}>
                <div className="flex items-baseline" style={{ gap: '8px' }}>
                  <span style={{ color: '#e53935', fontSize: '22px', fontWeight: '700' }}>
                    {product.currentPrice.toFixed(2)} OMR
                  </span>
                  <span style={{ color: '#999', fontSize: '14px', textDecoration: 'line-through' }}>
                    {product.originalPrice.toFixed(2)} OMR
                  </span>
                </div>
                <span style={{ color: '#009688', fontWeight: '500', fontSize: '13px' }}>
                  {actualSoldCount} {t('product.itemsSold')}
                </span>
              </div>
            </div>

            {/* Right Column - Order Form */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0px 1px 4px rgba(0,0,0,0.08)'
              }}
            >
              <h2 style={{ fontSize: isArabic ? '26px' : '22px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                {t('orderForm.orderNow')}
              </h2>
              <p style={{ color: '#555', fontSize: isArabic ? '15px' : '13px', marginBottom: '20px' }}>
                {t('orderForm.formMessage')}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: isArabic ? '16px' : '14px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                    {t('orderForm.fullName')}<span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={`${t('orderForm.fullName')}*`}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: isArabic ? '17px' : '15px',
                      color: '#000000',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label style={{ display: 'block', fontSize: isArabic ? '16px' : '14px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                    {t('orderForm.mobile')}<span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="09 1233456"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: isArabic ? '17px' : '15px',
                      color: '#000000',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label style={{ display: 'block', fontSize: isArabic ? '16px' : '14px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                    {t('orderForm.quantity')}<span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: isArabic ? '17px' : '15px',
                      color: '#000000',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    {quantityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: isArabic ? '16px' : '14px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                    {t('orderForm.city')}<span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: isArabic ? '17px' : '15px',
                      color: '#000000',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">{t('orderForm.selectCity')}*</option>
                    {cities.map((city, idx) => {
                      const lang = isArabic ? 'ar' : 'en';
                      const cityName = getCityName(city, lang);
                      return (
                        <option key={idx} value={cityName}>
                          {cityName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label style={{ display: 'block', fontSize: isArabic ? '16px' : '14px', fontWeight: '600', color: '#222', marginBottom: '6px' }}>
                    {t('orderForm.deliveryAddress')}<span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={t('orderForm.addressPlaceholder')}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: isArabic ? '17px' : '15px',
                      color: '#000000',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: '600',
                    padding: isArabic ? '14px' : '12px',
                    borderRadius: '5px',
                    border: 'none',
                    fontSize: isArabic ? '16px' : '13px',
                    textTransform: isArabic ? 'none' : 'uppercase',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  className="hover:opacity-90"
                >
                  {t('orderForm.submitOrder')}
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Description Section */}
          {!orderSubmitted && (
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              marginTop: '20px',
              boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <div style={{ borderBottom: '1px solid #eee', padding: '14px 20px' }}>
              <h3 style={{ fontSize: isArabic ? '18px' : '15px', fontWeight: '600', color: '#222' }}>{t('product.description')}</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontWeight: '500', color: '#222', marginBottom: '14px', fontSize: isArabic ? '18px' : '15px' }}>{productDescription}</p>
              <ol style={{ listStyleType: 'decimal', paddingLeft: isArabic ? '0' : '18px', paddingRight: isArabic ? '18px' : '0', color: '#222', lineHeight: isArabic ? '2.2' : '2', fontSize: isArabic ? '17px' : '15px' }}>
                {productFeatures.map((feature, index) => (
                  <li key={index} style={{ marginBottom: isArabic ? '8px' : '4px', paddingRight: isArabic ? '8px' : '0' }}>{feature}</li>
                ))}
              </ol>
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppFab />
    </div>
  );
}
