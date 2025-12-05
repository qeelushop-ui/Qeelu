'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/products';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductTitle } from '@/utils/getProductText';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t, i18n } = useTranslation();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isArabic = mounted && i18n.language?.startsWith('ar');
  
  return (
    <Link href={`/product/${product.id}`}>
      <article 
        className="product-card cursor-pointer"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
          padding: '12px'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - No border/outline */}
        <div 
          className="product-image-wrapper relative overflow-hidden"
          style={{ borderRadius: '10px' }}
        >
          {/* Discount Badge - Top Right */}
          <span 
            className="badge-discount absolute z-10"
            style={{
              top: '8px',
              right: '8px',
              backgroundColor: '#e53935',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            {product.discount}% {t('product.off')}
          </span>
          
          {/* Product Image - Zooms on hover */}
          <div 
            className="relative" 
            style={{ 
              paddingBottom: '100%',
              overflow: 'hidden',
              borderRadius: '10px'
            }}
          >
            {!imgError ? (
              <Image
                src={product.image}
                alt={mounted ? getProductTitle(product, isArabic ? 'ar' : 'en') : (typeof product.title === 'object' ? product.title.en : product.title || 'Product')}
                fill
                className="object-cover"
                style={{ 
                  borderRadius: '10px',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImgError(true)}
                suppressHydrationWarning
              />
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm"
                style={{ borderRadius: '10px' }}
              >
                Image
              </div>
            )}
          </div>
          
          {/* Free Delivery Badge - Bottom Left */}
          {product.freeDelivery && (
            <span 
              className="badge-delivery absolute z-10"
              style={{
                bottom: '8px',
                left: '8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                padding: '3px 8px',
                borderRadius: '50px'
              }}
            >
              {t('product.freeDelivery')}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div style={{ paddingTop: '10px', paddingBottom: '4px' }}>
          {/* Product Title */}
          <h3 
            className="product-title line-clamp-2"
            style={{
              marginTop: '8px',
              fontSize: isArabic ? '17px' : '15px',
              color: '#222222',
              lineHeight: isArabic ? '1.5' : '1.3',
              minHeight: isArabic ? '52px' : '40px',
              fontWeight: isArabic ? '500' : '400'
            }}
            suppressHydrationWarning
          >
            {mounted ? getProductTitle(product, isArabic ? 'ar' : 'en') : (typeof product.title === 'object' ? product.title.en : product.title || 'Product')}
          </h3>
          
          {/* Pricing - OMR */}
          <div className="product-pricing flex items-baseline" style={{ marginTop: '8px', gap: '8px' }}>
            <span 
              className="current-price font-bold"
              style={{ color: '#e53935', fontSize: '16px' }}
            >
              {product.currentPrice.toFixed(2)} OMR
            </span>
            <span 
              className="original-price line-through"
              style={{ color: '#999999', fontSize: '14px' }}
            >
              {product.originalPrice.toFixed(2)} OMR
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
