/**
 * Helper function to get product text in current language using i18next
 * First checks i18next translations, then falls back to product's own translations
 */

import i18n from '@/i18n';
import { autoTranslate } from './translation';

// Type for products that support both old and new formats
interface ProductText {
  id?: number | string;
  title?: string | { en: string; ar: string };
  titleAr?: string;
  description?: string | { en: string; ar: string };
  descriptionAr?: string;
  features?: string[] | { en: string[]; ar: string[] };
  featuresAr?: string[];
}

/**
 * Get product title from i18next or product object
 */
function getTitleFromI18n(productId: string | number, lang: 'en' | 'ar'): string | null {
  try {
    const key = `products.${productId}.title`;
    const translation = i18n.getResource(lang, 'translation', key);
    return translation || null;
  } catch {
    return null;
  }
}

/**
 * Get product description from i18next
 */
function getDescriptionFromI18n(productId: string | number, lang: 'en' | 'ar'): string | null {
  try {
    const key = `products.${productId}.description`;
    const translation = i18n.getResource(lang, 'translation', key);
    return translation || null;
  } catch {
    return null;
  }
}

/**
 * Get product features from i18next
 */
function getFeaturesFromI18n(productId: string | number, lang: 'en' | 'ar'): string[] | null {
  try {
    const key = `products.${productId}.features`;
    const translation = i18n.getResource(lang, 'translation', key);
    return Array.isArray(translation) ? translation : null;
  } catch {
    return null;
  }
}

/**
 * Get product title in specified language
 * Priority: 1. i18next translation, 2. Product's own translation, 3. Auto-translate
 * If lang is not provided, uses current i18next language
 */
export function getProductTitle(product: ProductText, lang?: 'en' | 'ar'): string {
  if (!product) return '';
  
  // Use i18next current language if lang not provided
  const currentLang = lang || (i18n.language === 'ar' ? 'ar' : 'en');
  
  // First, try to get from i18next (for products with IDs in JSON files)
  const i18nTitle = product.id ? getTitleFromI18n(product.id, currentLang) : null;
  if (i18nTitle) {
    return i18nTitle;
  }
  
  // If product has nested title object
  if (typeof product.title === 'object' && product.title.en && product.title.ar) {
    const titleEn = product.title.en;
    const titleAr = product.title.ar;
    
    // If Arabic is same as English or empty, translate on-the-fly
    if (currentLang === 'ar') {
      if (!titleAr || titleAr === titleEn || titleAr.trim() === '') {
        return autoTranslate(titleEn, 'ar');
      }
      return titleAr;
    }
    return titleEn;
  }
  
  // Old format - single string title
  const title = typeof product.title === 'string' ? product.title : '';
  if (currentLang === 'ar') {
    // Check if there's a titleAr field
    const titleAr = product.titleAr;
    if (titleAr && titleAr !== title && titleAr.trim() !== '') {
      return titleAr;
    }
    // Translate on-the-fly
    return autoTranslate(title, 'ar');
  }
  
  return title;
}


/**
 * Get product description in specified language
 * Priority: 1. i18next translation, 2. Product's own translation, 3. Auto-translate
 * If lang is not provided, uses current i18next language
 */
export function getProductDescription(product: ProductText, lang?: 'en' | 'ar'): string {
  if (!product) return '';
  
  // Use i18next current language if lang not provided
  const currentLang = lang || (i18n.language === 'ar' ? 'ar' : 'en');
  
  // First, try to get from i18next
  const i18nDesc = product.id ? getDescriptionFromI18n(product.id, currentLang) : null;
  if (i18nDesc) {
    return i18nDesc;
  }
  
  // If product has nested description object
  if (typeof product.description === 'object' && product.description.en && product.description.ar) {
    const descEn = product.description.en;
    const descAr = product.description.ar;
    
    // If Arabic is same as English or empty, translate on-the-fly
    if (currentLang === 'ar') {
      if (!descAr || descAr === descEn || descAr.trim() === '') {
        return autoTranslate(descEn, 'ar');
      }
      return descAr;
    }
    return descEn;
  }
  
  // Old format
  const description = typeof product.description === 'string' ? product.description : '';
  if (currentLang === 'ar') {
    const descAr = product.descriptionAr;
    if (descAr && descAr !== description && descAr.trim() !== '') {
      return descAr;
    }
    return autoTranslate(description, 'ar');
  }
  
  return description;
}

/**
 * Get product features in specified language
 * Priority: 1. i18next translation, 2. Product's own translation, 3. Auto-translate
 * If lang is not provided, uses current i18next language
 */
export function getProductFeatures(product: ProductText, lang?: 'en' | 'ar'): string[] {
  if (!product || !product.features) return [];
  
  // Use i18next current language if lang not provided
  const currentLang = lang || (i18n.language === 'ar' ? 'ar' : 'en');
  
  // First, try to get from i18next
  const i18nFeatures = product.id ? getFeaturesFromI18n(product.id, currentLang) : null;
  if (i18nFeatures && i18nFeatures.length > 0) {
    return i18nFeatures;
  }
  
  // If features is nested object
  if (typeof product.features === 'object' && 'en' in product.features) {
    const featuresEn = product.features.en || [];
    const featuresAr = product.features.ar || [];
    
    if (currentLang === 'ar') {
      // If Arabic features are missing or same as English, translate on-the-fly
      if (!featuresAr || featuresAr.length === 0 || 
          (featuresAr.length === featuresEn.length && 
           featuresAr.every((f: string, i: number) => f === featuresEn[i]))) {
        return featuresEn.map((f: string) => autoTranslate(f, 'ar'));
      }
      return featuresAr;
    }
    return featuresEn;
  }
  
  // Old format - array
  if (Array.isArray(product.features)) {
    if (currentLang === 'ar') {
      const featuresAr = product.featuresAr;
      if (featuresAr && Array.isArray(featuresAr) && featuresAr.length > 0) {
        return featuresAr;
      }
      // Translate on-the-fly
      return product.features.map((f: string) => autoTranslate(f, 'ar'));
    }
    return product.features;
  }
  
  return [];
}

/**
 * Add product translations to i18next dynamically
 * This is called when a new product is added
 */
export function addProductToI18n(product: ProductText) {
  if (!product || !product.id) return;
  
  const productId = String(product.id);
  
  // Add English translations
  if (typeof product.title === 'object' && product.title.en) {
    i18n.addResource('en', 'translation', `products.${productId}.title`, product.title.en);
    if (typeof product.description === 'object' && product.description.en) {
      i18n.addResource('en', 'translation', `products.${productId}.description`, product.description.en);
    }
    if (typeof product.features === 'object' && !Array.isArray(product.features) && 'en' in product.features) {
      i18n.addResource('en', 'translation', `products.${productId}.features`, product.features.en as never);
    }
  } else if (typeof product.title === 'string') {
    i18n.addResource('en', 'translation', `products.${productId}.title`, product.title);
    if (typeof product.description === 'string') {
      i18n.addResource('en', 'translation', `products.${productId}.description`, product.description);
    }
    if (Array.isArray(product.features)) {
      i18n.addResource('en', 'translation', `products.${productId}.features`, product.features as never);
    }
  }
  
  // Add Arabic translations
  if (typeof product.title === 'object' && product.title.ar) {
    i18n.addResource('ar', 'translation', `products.${productId}.title`, product.title.ar);
    if (typeof product.description === 'object' && product.description.ar) {
      i18n.addResource('ar', 'translation', `products.${productId}.description`, product.description.ar);
    }
    if (typeof product.features === 'object' && !Array.isArray(product.features) && 'ar' in product.features) {
      i18n.addResource('ar', 'translation', `products.${productId}.features`, product.features.ar as never);
    }
  } else if (product.titleAr) {
    i18n.addResource('ar', 'translation', `products.${productId}.title`, product.titleAr);
    if (product.descriptionAr) {
      i18n.addResource('ar', 'translation', `products.${productId}.description`, product.descriptionAr);
    }
    if (product.featuresAr) {
      i18n.addResource('ar', 'translation', `products.${productId}.features`, product.featuresAr as never);
    }
  }
}

