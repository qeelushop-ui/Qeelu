import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { ensureDatabaseInitialized } from '@/lib/auto-init';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get admin from database
    let admin;
    try {
      admin = await sql`
        SELECT id, email, password FROM admin WHERE email = ${email} LIMIT 1
      `;
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // If admin table doesn't exist, try to create it
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS admin (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        // Insert default admin
        await sql`
          INSERT INTO admin (email, password)
          VALUES ('qeelu.shop@gmail.com', 'admin123_Qeelu')
          ON CONFLICT (email) DO NOTHING
        `;
        // Retry query
        admin = await sql`
          SELECT id, email, password FROM admin WHERE email = ${email} LIMIT 1
        `;
      } catch (createError) {
        console.error('Error creating admin table:', createError);
        throw createError;
      }
    }

    if (!admin || admin.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Simple password comparison (in production, use bcrypt)
    if (admin[0].password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session token (simple approach - in production use JWT)
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Set cookie (30 days expiry)
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin[0].id,
        email: admin[0].email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to login',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

