export function calculateItemTotal(
  basePrice: number,
  quantity: number,
  discountPercent: number,
  gstPercent: number
): number {
  const baseTotal = basePrice * quantity;
  const discountAmount = baseTotal * (discountPercent / 100);
  const afterDiscount = baseTotal - discountAmount;
  const gstAmount = afterDiscount * (gstPercent / 100);
  const total = afterDiscount + gstAmount;
  
  return Math.round(total * 100) / 100;
}

export function calculateBillTotal(items: Array<{ totalPrice: number }>): number {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return Math.round(total * 100) / 100;
}
