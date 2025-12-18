import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ensureDatabaseInitialized } from '@/lib/auto-init';
import { generateNextOrderId } from '@/lib/order-id';

export const dynamic = 'force-dynamic';

// GET all orders
export async function GET() {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const rows = await sql`
      SELECT 
        id,
        customer,
        phone,
        city,
        address,
        products,
        total,
        status,
        date,
        time,
        created_at,
        updated_at
      FROM orders
      ORDER BY 
        CASE 
          WHEN id LIKE '#QE%' THEN CAST(SUBSTRING(id FROM 4) AS INTEGER)
          ELSE 0
        END DESC,
        created_at DESC
    `;

    // Transform database rows to Order format
    const orders = rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      customer: row.customer as string,
      phone: row.phone as string,
      city: row.city as string,
      address: row.address as string,
      products: row.products,
      total: parseFloat(String(row.total)),
      status: row.status as string,
      date: row.date as string,
      time: row.time as string,
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const body = await request.json();
    const {
      customer,
      phone,
      city,
      address,
      products,
      total,
      status,
      date,
      time,
    } = body;

    // Always generate a unique order ID on the server to avoid duplicate primary key errors
    let orderId: string;
    try {
      orderId = await generateNextOrderId();
    } catch (idError) {
      console.error('Error generating order ID, falling back to timestamp-based ID:', idError);
      const random = Math.floor(Math.random() * 9999) + 1;
      orderId = `#QE${random.toString().padStart(4, '0')}`;
    }

    console.log('Creating order with data:', { id: orderId, customer, phone, city, address, products, total, status, date, time });

    // Ensure proper type casting for PostgreSQL
    const result = await sql`
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
        ${customer},
        ${phone},
        ${city},
        ${address},
        ${JSON.stringify(products)}::jsonb,
        ${parseFloat(String(total))}::decimal,
        ${status || 'pending'},
        ${date}::date,
        ${time}::time
      )
      RETURNING *
    `;

    const row = result[0];
    const order = {
      id: row.id,
      customer: row.customer,
      phone: row.phone,
      city: row.city,
      address: row.address,
      products: row.products,
      total: parseFloat(String(row.total)),
      status: row.status,
      date: row.date,
      time: row.time,
    };

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update order
export async function PUT(request: NextRequest) {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const body = await request.json();
    const {
      id,
      customer,
      phone,
      city,
      address,
      products,
      total,
      status,
      date,
      time,
    } = body;

    const result = await sql`
      UPDATE orders
      SET
        customer = ${customer},
        phone = ${phone},
        city = ${city},
        address = ${address},
        products = ${JSON.stringify(products)},
        total = ${total},
        status = ${status},
        date = ${date},
        time = ${time},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const row = result[0];
    const order = {
      id: row.id,
      customer: row.customer,
      phone: row.phone,
      city: row.city,
      address: row.address,
      products: row.products,
      total: parseFloat(row.total),
      status: row.status,
      date: row.date,
      time: row.time,
    };

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    // Auto-initialize database on first use (only runs once)
    await ensureDatabaseInitialized().catch(err => {
      console.error('Auto-init warning:', err);
    });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM orders
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

