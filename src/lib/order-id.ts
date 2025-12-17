import { sql } from './db';

/**
 * Generate the next unique order ID in the format #QE0001, #QE0002, ...
 * This checks the current maximum numeric part in existing IDs to avoid duplicates.
 */
export async function generateNextOrderId(): Promise<string> {
  // Find the highest existing #QE id
  const rows = await sql`
    SELECT id
    FROM orders
    WHERE id LIKE '#QE%'
    ORDER BY
      CAST(SUBSTRING(id FROM 4) AS INTEGER) DESC
    LIMIT 1
  `;

  let nextNumber = 1;

  if (Array.isArray(rows) && rows.length > 0) {
    const lastId = (rows[0] as { id: string }).id;
    const numericPart = parseInt(lastId.replace('#QE', ''), 10);
    if (!Number.isNaN(numericPart) && numericPart > 0) {
      nextNumber = numericPart + 1;
    }
  }

  return `#QE${nextNumber.toString().padStart(4, '0')}`;
}


