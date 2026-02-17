import type { Category, ItemMaster, Bill, BillItem } from '@/models/types';
import type { Settings } from '@/models/settings';
import type { Category as BackendCategory, Item as BackendItem, Bill as BackendBill, BillItem as BackendBillItem, Settings as BackendSettings } from '@/backend';

export function categoryToBackend(category: Category): BackendCategory {
  return {
    id: category.categoryId,
    name: category.categoryName,
    icon: '', // Not used in current implementation
    updatedAt: BigInt(category.updatedAt || Date.now()),
  };
}

export function categoryFromBackend(backendCategory: BackendCategory): Category {
  return {
    categoryId: backendCategory.id,
    categoryName: backendCategory.name,
    updatedAt: Number(backendCategory.updatedAt),
    deleted: false,
  };
}

export function itemToBackend(item: ItemMaster): BackendItem {
  return {
    id: item.itemId,
    name: item.itemName,
    categoryId: item.categoryId,
    price: BigInt(Math.round(item.basePrice * 100)), // Convert to cents
    updatedAt: BigInt(item.updatedAt || Date.now()),
  };
}

export function itemFromBackend(backendItem: BackendItem): ItemMaster {
  return {
    itemId: backendItem.id,
    itemName: backendItem.name,
    categoryId: backendItem.categoryId,
    basePrice: Number(backendItem.price) / 100, // Convert from cents
    gstPercentage: 0, // Not stored in backend, will be preserved from local
    updatedAt: Number(backendItem.updatedAt),
    deleted: false,
  };
}

export function billToBackend(bill: Bill): BackendBill {
  return {
    id: bill.billId,
    date: bill.date,
    items: [], // Bill items are synced separately
    total: BigInt(Math.round(bill.totalAmount * 100)), // Convert to cents
    updatedAt: BigInt(bill.updatedAt || Date.now()),
  };
}

export function billFromBackend(backendBill: BackendBill): Bill {
  return {
    billId: backendBill.id,
    billNumber: '', // Not stored in backend, will be preserved from local
    customerName: '', // Not stored in backend, will be preserved from local
    phone: '', // Not stored in backend, will be preserved from local
    address: '', // Not stored in backend, will be preserved from local
    date: backendBill.date,
    totalAmount: Number(backendBill.total) / 100, // Convert from cents
    updatedAt: Number(backendBill.updatedAt),
    deleted: false,
  };
}

export function settingsToBackend(settings: Settings): BackendSettings {
  return {
    currency: 'INR',
    updatedAt: BigInt(settings.updatedAt || Date.now()),
  };
}

export function settingsFromBackend(backendSettings: BackendSettings, localSettings: Settings): Settings {
  return {
    ...localSettings,
    updatedAt: Number(backendSettings.updatedAt),
  };
}
