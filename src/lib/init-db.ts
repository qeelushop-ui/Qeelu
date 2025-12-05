import { sql } from './db';

/**
 * Initialize database tables
 * This script creates the necessary tables for products and orders
 */
export async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title_en TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        current_price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2) NOT NULL,
        discount INTEGER NOT NULL,
        image TEXT NOT NULL,
        images JSONB DEFAULT '[]',
        free_delivery BOOLEAN DEFAULT true,
        sold_count INTEGER DEFAULT 0,
        category TEXT NOT NULL,
        features_en JSONB DEFAULT '[]',
        features_ar JSONB DEFAULT '[]',
        pricing_tiers JSONB DEFAULT '[]',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        products JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        date DATE NOT NULL,
        time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create abandoned_orders table (unsubmitted orders)
    await sql`
      CREATE TABLE IF NOT EXISTS abandoned_orders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT,
        address TEXT,
        quantity TEXT,
        product_id TEXT,
        status TEXT DEFAULT 'unsubmitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

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

    // Insert default admin if not exists
    try {
      const existingAdmin = await sql`SELECT COUNT(*) as count FROM admin`;
      const count = Number(existingAdmin[0]?.count || 0);
      
      if (count === 0) {
        await sql`
          INSERT INTO admin (email, password)
          VALUES ('qeelu.shop@gmail.com', 'admin123_Qeelu')
          ON CONFLICT (email) DO NOTHING
        `;
        console.log('Default admin created');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
      // Try to insert anyway (might already exist)
      try {
        await sql`
          INSERT INTO admin (email, password)
          VALUES ('qeelu.shop@gmail.com', 'admin123_Qeelu')
          ON CONFLICT (email) DO NOTHING
        `;
      } catch (insertError) {
        // Admin might already exist, that's okay
        console.log('Admin already exists or error inserting');
      }
    }

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_abandoned_phone ON abandoned_orders(phone)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_abandoned_name ON abandoned_orders(name)`;

    console.log('Database initialized successfully!');
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

