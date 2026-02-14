import { getBills } from '@/storage/repositories';

export async function generateBillNumber(): Promise<string> {
  const bills = await getBills();
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const existingNumbers = bills
    .map(b => b.billNumber)
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, '')) || 0);
  
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
  
  return `${prefix}${nextNumber}`;
}
