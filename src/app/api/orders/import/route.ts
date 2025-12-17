import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateNextOrderId } from '@/lib/order-id';

export const dynamic = 'force-dynamic';

/**
 * Import orders from Excel data
 * Expected format: Array of orders with customer, phone, city, address, products, total
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of orders.' },
        { status: 400 }
      );
    }

    // Fetch all products from database for intelligent pricing
    const allProducts = await sql`
      SELECT id, title_en, title_ar, current_price, pricing_tiers 
      FROM products
    `;

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const orderData of orders) {
      try {
        // Validate required fields
        if (!orderData.customer || !orderData.phone || !orderData.city || !orderData.address) {
          errors.push(`Row skipped: Missing required fields (customer, phone, city, or address)`);
          errorCount++;
          continue;
        }

        if (!orderData.products || orderData.products.length === 0) {
          errors.push(`Order for ${orderData.customer} skipped: No products`);
          errorCount++;
          continue;
        }

        // Process products with intelligent pricing
        const processedProducts = orderData.products.map((prod: any) => {
          const productName = prod.name;
          const quantity = prod.quantity;
          const excelPrice = prod.price;

          // Try to find product in database (fuzzy matching)
          const dbProduct = (allProducts as any[]).find((p: any) => {
            const titleEn = String(p.title_en || '').toLowerCase();
            const titleAr = String(p.title_ar || '');
            const searchName = String(productName || '').toLowerCase();
            
            return titleEn.includes(searchName) || 
                   searchName.includes(titleEn) ||
                   titleAr === productName;
          });

          if (dbProduct) {
            // Product exists in database
            const pricingTiers = (dbProduct as any).pricing_tiers;
            
            if (Array.isArray(pricingTiers) && pricingTiers.length > 0) {
              // Use tier price if exact quantity tier exists
              const tier = (pricingTiers as any[]).find((t: any) => t.quantity === quantity);
              
              if (tier) {
                // tier.price is total for that quantity → store unit price
                const unitPrice = Number(tier.price) / Number(tier.quantity || 1);
                return {
                  name: productName,
                  quantity,
                  price: Number.isFinite(unitPrice) ? unitPrice : Number(excelPrice) || 0,
                };
              }
            }

            // Fallback to product's current price or excel price
            const fallbackPrice = Number((dbProduct as any).current_price ?? excelPrice) || 0;
            return {
              name: productName,
              quantity,
              price: fallbackPrice,
            };
          }

          // Product not in database - use Excel price as unit price
          return {
            name: productName,
            quantity,
            price: Number(excelPrice) || 0,
          };
        });

        // Generate unique order ID using shared helper
        const orderId = await generateNextOrderId();

        // Get current date and time
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().slice(0, 5);

        // Calculate total based on processed products
        const total = processedProducts.reduce(
          (sum: number, p: any) => sum + (p.price * p.quantity), 
          0
        );

        // Insert into database
        await sql`
          INSERT INTO orders (
            id,
            customer,
            phone,
            city,
            address,
            products,
            total,
            status,
            date,
            time
          )
          VALUES (
            ${orderId},
            ${orderData.customer},
            ${orderData.phone},
            ${orderData.city},
            ${orderData.address},
            ${JSON.stringify(processedProducts)},
            ${total},
            'pending',
            ${date},
            ${time}
          )
        `;

        successCount++;
      } catch (error) {
        console.error('Error importing order:', error);
        errors.push(`Failed to import order for ${orderData.customer}: ${error}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      failed: errorCount,
      total: orders.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error importing orders:', error);
    return NextResponse.json(
      { error: 'Failed to import orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

