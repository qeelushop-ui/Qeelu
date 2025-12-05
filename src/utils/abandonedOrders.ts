/**
 * Abandoned/Unsubmitted Orders Management
 * All data stored in NeonDB via API
 * 
 * Validation Rules:
 * - Name is REQUIRED (must not be empty)
 * - Phone is REQUIRED (must not be empty)
 * - At least 4 fields total must be filled (name, phone, city, address, quantity, product_id)
 * - If validation fails, order will NOT be saved
 */

export interface AbandonedOrder {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  quantity: string;
  product_id: string;
  status: 'unsubmitted';
  created_at: string;
}

/**
 * Count how many fields are filled (non-empty)
 */
export function countFilledFields(data: Partial<AbandonedOrder>): number {
  let count = 0;
  if (data.name && data.name.trim()) count++;
  if (data.phone && data.phone.trim()) count++;
  if (data.city && data.city.trim()) count++;
  if (data.address && data.address.trim()) count++;
  if (data.quantity && data.quantity.trim()) count++;
  if (data.product_id && data.product_id.trim()) count++;
  return count;
}

/**
 * Save an abandoned order to database via API
 * Requirements:
 * - Name and phone are REQUIRED (must not be empty)
 * - At least 4 fields total must be filled
 */
export async function saveAbandonedOrder(data: {
  name: string;
  phone: string;
  city: string;
  address: string;
  quantity: string;
  product_id: string;
}): Promise<boolean> {
  // Check if name and phone are provided (REQUIRED)
  if (!data.name || !data.name.trim() || !data.phone || !data.phone.trim()) {
    return false;
  }

  // Check if at least 4 fields are filled
  const filledCount = countFilledFields(data);
  if (filledCount < 4) {
    return false;
  }

  try {
    const response = await fetch('/api/abandoned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving abandoned order:', error);
    return false;
  }
}

/**
 * Remove abandoned order when user successfully submits (via API)
 */
export async function removeAbandonedOrderOnSubmit(phone: string, name: string): Promise<void> {
  try {
    await fetch(`/api/abandoned?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing abandoned order:', error);
  }
}

