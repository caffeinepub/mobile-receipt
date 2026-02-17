export interface Category {
  categoryId: string;
  categoryName: string;
  updatedAt?: number;
  deleted?: boolean;
}

export interface ItemMaster {
  itemId: string;
  itemName: string;
  categoryId: string;
  basePrice: number;
  gstPercentage: number;
  updatedAt?: number;
  deleted?: boolean;
}

export interface BillItem {
  itemId: string;
  billId: string;
  description: string;
  basePrice: number;
  quantity: number;
  discount: number;
  gst: number;
  totalPrice: number;
  descriptionMode?: 'catalogue' | 'manual';
  catalogueItemId?: string;
  updatedAt?: number;
  deleted?: boolean;
}

export interface Bill {
  billId: string;
  billNumber: string;
  customerName: string;
  phone: string;
  address: string;
  date: string;
  totalAmount: number;
  updatedAt?: number;
  deleted?: boolean;
}
