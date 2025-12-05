'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from '@/data/products';
import { autoTranslate, translateArray, cleanTranslatedText } from '@/utils/translation';
import { addProductToI18n } from '@/utils/getProductText';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Partial<Product>, currentLang: 'en' | 'ar') => Promise<{ success: boolean; error?: string }>;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  toggleProductStatus: (id: number) => void;
  getActiveProducts: () => Product[];
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products from API, using initial products');
        setProducts(initialProducts);
      }
  } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Partial<Product>, currentLang: 'en' | 'ar') => {
    // Extract text from current language input
    const titleText = typeof productData.title === 'string' 
      ? productData.title 
      : (currentLang === 'en' ? productData.title?.en || '' : productData.title?.ar || '');
    
    const descriptionText = typeof productData.description === 'string'
      ? productData.description
      : (currentLang === 'en' ? productData.description?.en || '' : productData.description?.ar || '');

    const featuresText = Array.isArray(productData.features)
      ? productData.features
      : (currentLang === 'en' ? productData.features?.en || [] : productData.features?.ar || []);

    // Auto-translate to other language
    const otherLang: 'en' | 'ar' = currentLang === 'en' ? 'ar' : 'en';
    const titleEn = currentLang === 'en' ? titleText : autoTranslate(titleText, 'en');
    const titleAr = currentLang === 'ar' ? titleText : autoTranslate(titleText, 'ar');
    
    const descriptionEn = currentLang === 'en' ? descriptionText : autoTranslate(descriptionText, 'en');
    const descriptionAr = currentLang === 'ar' ? descriptionText : autoTranslate(descriptionText, 'ar');

    const featuresEn = currentLang === 'en' ? featuresText : translateArray(featuresText, 'en');
    const featuresAr = currentLang === 'ar' ? featuresText : translateArray(featuresText, 'ar');

    const newProduct = {
      title: { 
        en: cleanTranslatedText(titleEn), 
        ar: cleanTranslatedText(titleAr) 
      },
      description: { 
        en: cleanTranslatedText(descriptionEn), 
        ar: cleanTranslatedText(descriptionAr) 
      },
      currentPrice: productData.currentPrice || 0,
      originalPrice: productData.originalPrice || 0,
      discount: productData.discount || 0,
      image: productData.image || '',
      images: productData.images || [productData.image || ''],
      freeDelivery: productData.freeDelivery || false,
      soldCount: productData.soldCount || Math.floor(Math.random() * 900) + 100, // Random 100-999
      category: productData.category || 'other',
      features: featuresEn.length > 0 
        ? { 
            en: featuresEn.map(cleanTranslatedText), 
            ar: featuresAr.map(cleanTranslatedText) 
          } 
        : undefined,
      pricingTiers: productData.pricingTiers || [],
      status: productData.status || 'active',
    };
    
    console.log('🔄 ProductContext - Adding product with pricingTiers:', newProduct.pricingTiers);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const data = await response.json();
        // Add to i18next for dynamic translation support
        addProductToI18n(data.product);
        setProducts([data.product, ...products]);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('Failed to add product:', errorData);
        
        // Check for duplicate key error
        if (errorData.details && errorData.details.includes('duplicate key')) {
          return { 
            success: false, 
            error: 'Product ID already exists. Please reset the database sequence first by visiting: /api/reset-sequence' 
          };
        }
        
        return { success: false, error: errorData.details || errorData.error || 'Failed to add product' };
      }
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Network error occurred' };
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const data = await response.json();
    setProducts(products.map(p => 
          p.id === data.product.id ? data.product : p
    ));
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
    setProducts(products.filter(p => p.id !== id));
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductStatus = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const updatedProduct = {
        ...product,
        status: (product.status === 'active' || !product.status) ? 'inactive' as const : 'active' as const,
      };
      await updateProduct(updatedProduct);
    }
  };

  // Get only active products for the main store
  const getActiveProducts = () => {
    return products.filter(p => p.status === 'active' || !p.status);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      getActiveProducts,
      loading,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
