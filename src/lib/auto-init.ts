import { sql } from './db';
import { initDatabase } from './init-db';
import { products as initialProducts } from '@/data/products';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Auto-initialize database on first use
 * This will only run once, even if called multiple times
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  // If already initialized, return immediately
  if (isInitialized) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Check if products table exists (indicator that DB is initialized)
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        )
      `;

      const tableExists = tableCheck[0]?.exists || false;

      if (!tableExists) {
        console.log('🔄 Auto-initializing database...');
        await initDatabase();
        console.log('✅ Database initialized');
      } else {
        // Even if products table exists, check if admin table exists
        const adminTableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'admin'
          )
        `;
        
        const adminTableExists = adminTableCheck[0]?.exists || false;
        
        if (!adminTableExists) {
          console.log('🔄 Creating admin table...');
          // Create admin table
          await sql`
            CREATE TABLE IF NOT EXISTS admin (
              id SERIAL PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
        }
        
        // Ensure default admin exists (even if table already exists)
        try {
          const adminCheck = await sql`SELECT COUNT(*) as count FROM admin WHERE email = 'qeelu.shop@gmail.com'`;
          const adminExists = Number(adminCheck[0]?.count || 0) > 0;
          
          if (!adminExists) {
            await sql`
              INSERT INTO admin (email, password)
              VALUES ('qeelu.shop@gmail.com', 'admin123_Qeelu')
              ON CONFLICT (email) DO NOTHING
            `;
            console.log('✅ Default admin created');
          }
        } catch (error) {
          console.error('Error checking/creating default admin:', error);
        }
      }

      // Check if products exist, if not migrate
      const productCount = await sql`SELECT COUNT(*) as count FROM products`;
      const count = Number(productCount[0]?.count || 0);

      if (count === 0 && initialProducts.length > 0) {
        console.log('🔄 Auto-migrating products...');
        
        for (const product of initialProducts) {
          try {
            await sql`
              INSERT INTO products (
                title_en,
                title_ar,
                description_en,
                description_ar,
                current_price,
                original_price,
                discount,
                image,
                images,
                free_delivery,
                sold_count,
                category,
                features_en,
                features_ar,
                pricing_tiers,
                status
              )
              VALUES (
                ${typeof product.title === 'object' ? product.title.en : product.title},
                ${typeof product.title === 'object' ? product.title.ar : product.title},
                ${typeof product.description === 'object' ? product.description.en : product.description},
                ${typeof product.description === 'object' ? product.description.ar : product.description},
                ${product.currentPrice},
                ${product.originalPrice},
                ${product.discount},
                ${product.image},
                ${JSON.stringify(product.images || [])},
                ${product.freeDelivery},
                ${product.soldCount},
                ${product.category},
                ${JSON.stringify(typeof product.features === 'object' && 'en' in product.features ? product.features.en : (Array.isArray(product.features) ? product.features : []))},
                ${JSON.stringify(typeof product.features === 'object' && 'ar' in product.features ? product.features.ar : [])},
                ${JSON.stringify(product.pricingTiers || [])},
                ${product.status || 'active'}
              )
            `;
          } catch (error) {
            console.error(`Error migrating product ${product.id}:`, error);
          }
        }
        console.log('✅ Products migrated');
      }

      isInitialized = true;
    } catch (error) {
      console.error('❌ Auto-initialization failed:', error);
      // Reset promise so it can be retried
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

