/**
 * Utility function to calculate actual sold count for a product from orders
 * Matches product titles (both English and Arabic) with order product names
 */

import { Order } from '@/context/OrderContext';
import { Product } from '@/data/products';
import { getProductTitle } from './getProductText';

/**
 * Calculate actual sold count for a product from orders
 * Only counts orders that are not cancelled
 */
export function getSoldCount(product: Product, orders: Order[]): number {
  if (!product || !orders || orders.length === 0) {
    return 0;
  }

  // Get product titles in both languages
  const productTitleEn = getProductTitle(product, 'en');
  const productTitleAr = getProductTitle(product, 'ar');

  // Count sold items from non-cancelled orders
  let soldCount = 0;

  orders.forEach(order => {
    // Skip cancelled orders
    if (order.status === 'cancelled') {
      return;
    }

    order.products.forEach(orderProduct => {
      // Match by product name (could be in English or Arabic depending on language when order was placed)
      if (
        orderProduct.name === productTitleEn ||
        orderProduct.name === productTitleAr ||
        orderProduct.name.trim() === productTitleEn.trim() ||
        orderProduct.name.trim() === productTitleAr.trim()
      ) {
        soldCount += orderProduct.quantity;
      }
    });
  });

  return soldCount;
}

