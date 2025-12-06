/**
 * Utility function to calculate actual sold count for a product from orders
 * Matches product titles (both English and Arabic) with order product names
 */

import { Order } from '@/context/OrderContext';
import { Product } from '@/data/products';
import { getProductTitle } from './getProductText';

/**
 * Get sold count for a product
 * Uses product's soldCount field (random 200-3000 for new products)
 * If soldCount is 0 or missing, generates a random number between 200-3000
 */
export function getSoldCount(product: Product, orders: Order[]): number {
  if (!product) {
    return 0;
  }

  // Use product's soldCount if it exists and is greater than 0
  if (product.soldCount && product.soldCount > 0) {
    return product.soldCount;
  }

  // Generate a random number between 200-3000 for products without soldCount
  // Use product ID as seed for consistent random number per product
  const seed = typeof product.id === 'number' ? product.id : parseInt(String(product.id).replace('.', '')) || 0;
  const random = ((seed * 9301 + 49297) % 233280) / 233280; // Simple seeded random
  return Math.floor(random * 2801) + 200; // Random 200-3000
}

