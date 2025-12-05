import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { ensureDatabaseInitialized } from '@/lib/auto-init';

export const dynamic = 'force-dynamic';

// Get admin profile
export async function GET() {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const admin = await sql`
      SELECT id, email FROM admin LIMIT 1
    `;

    if (admin.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin[0].id,
        email: admin[0].email,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// Update admin profile (email and password)
export async function PUT(request: NextRequest) {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { email, password, currentPassword } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get current admin
    const currentAdmin = await sql`
      SELECT id, email, password FROM admin LIMIT 1
    `;

    if (currentAdmin.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // If password is being updated, verify current password
    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      if (currentAdmin[0].password !== currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        );
      }
    }

    // Update admin
    const updateData: { email: string; password?: string } = { email };
    if (password) {
      updateData.password = password;
    }

    await sql`
      UPDATE admin 
      SET email = ${updateData.email},
          ${password ? sql`password = ${updateData.password},` : sql``}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${currentAdmin[0].id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      admin: {
        id: currentAdmin[0].id,
        email: updateData.email,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

