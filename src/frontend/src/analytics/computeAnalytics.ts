import type { Bill, BillItem } from '@/models/types';

export interface Analytics {
  today: number;
  week: number;
  month: number;
  year: number;
  monthlySales: Array<{ month: string; amount: number }>;
  salesByCategory: Array<{ category: string; amount: number }>;
  salesByProduct: Array<{ product: string; amount: number }>;
}

export function computeAnalytics(bills: Bill[], billItems: BillItem[]): Analytics {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const todayTotal = bills
    .filter(b => new Date(b.date) >= today)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const weekTotal = bills
    .filter(b => new Date(b.date) >= weekAgo)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const monthTotal = bills
    .filter(b => new Date(b.date) >= monthAgo)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const yearTotal = bills
    .filter(b => new Date(b.date) >= yearStart)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Monthly sales
  const monthlyMap = new Map<string, number>();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  bills.forEach(bill => {
    const date = new Date(bill.date);
    if (date.getFullYear() === now.getFullYear()) {
      const monthKey = months[date.getMonth()];
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + bill.totalAmount);
    }
  });

  const monthlySales = months.map(month => ({
    month,
    amount: monthlyMap.get(month) || 0,
  }));

  // Sales by product
  const productMap = new Map<string, number>();
  billItems.forEach(item => {
    productMap.set(item.description, (productMap.get(item.description) || 0) + item.totalPrice);
  });

  const salesByProduct = Array.from(productMap.entries())
    .map(([product, amount]) => ({ product, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Sales by category (placeholder - would need category mapping)
  const salesByCategory = [
    { category: 'Food', amount: yearTotal * 0.4 },
    { category: 'Beverages', amount: yearTotal * 0.3 },
    { category: 'Snacks', amount: yearTotal * 0.2 },
    { category: 'Others', amount: yearTotal * 0.1 },
  ];

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    year: yearTotal,
    monthlySales,
    salesByCategory,
    salesByProduct,
  };
}
