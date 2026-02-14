import type { Bill, BillItem } from '@/models/types';

export async function exportToExcel(
  bills: Bill[],
  billItems: BillItem[],
  type: 'weekly' | 'monthly' | 'full' | 'backup'
): Promise<void> {
  // Create CSV content (simplified - in production use a library like xlsx)
  let csv = 'Bill Number,Date,Customer Name,Phone,Address,Total Amount\n';
  
  bills.forEach(bill => {
    csv += `"${bill.billNumber}","${bill.date}","${bill.customerName}","${bill.phone || ''}","${bill.address || ''}",${bill.totalAmount}\n`;
  });
  
  csv += '\n\nBill Items\n';
  csv += 'Bill Number,Description,Base Price,Quantity,Discount %,GST %,Total Price\n';
  
  billItems.forEach(item => {
    const bill = bills.find(b => b.billId === item.billId);
    if (bill) {
      csv += `"${bill.billNumber}","${item.description}",${item.basePrice},${item.quantity},${item.discount},${item.gst},${item.totalPrice}\n`;
    }
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mobile-receipt-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
