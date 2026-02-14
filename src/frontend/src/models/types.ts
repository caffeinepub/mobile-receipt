export interface Category {
  categoryId: string;
  categoryName: string;
}

export interface ItemMaster {
  itemId: string;
  itemName: string;
  categoryId: string;
  basePrice: number;
  gstPercentage: number;
}

export interface Bill {
  billId: string;
  billNumber: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  totalAmount: number;
  pdfPath?: string;
}

export interface BillItem {
  itemId: string;
  billId: string;
  slNo?: number;
  purchaseDate?: string;
  description: string;
  descriptionMode: 'catalogue' | 'manual';
  catalogueItemId?: string;
  basePrice: number;
  quantity: number;
  discount: number;
  gst: number;
  totalPrice: number;
}
