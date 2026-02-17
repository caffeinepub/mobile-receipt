import type { Category, ItemMaster, Bill, BillItem } from '@/models/types';
import type { Settings } from '@/models/settings';

export function mergeCategories(local: Category[], remote: Category[]): Category[] {
  const merged = new Map<string, Category>();

  // Add all local categories
  local.forEach(cat => merged.set(cat.categoryId, cat));

  // Merge remote categories using last-write-wins
  remote.forEach(remoteCat => {
    const localCat = merged.get(remoteCat.categoryId);
    if (!localCat || (remoteCat.updatedAt || 0) > (localCat.updatedAt || 0)) {
      merged.set(remoteCat.categoryId, remoteCat);
    }
  });

  return Array.from(merged.values());
}

export function mergeItems(local: ItemMaster[], remote: ItemMaster[]): ItemMaster[] {
  const merged = new Map<string, ItemMaster>();

  // Add all local items
  local.forEach(item => merged.set(item.itemId, item));

  // Merge remote items using last-write-wins
  remote.forEach(remoteItem => {
    const localItem = merged.get(remoteItem.itemId);
    if (!localItem || (remoteItem.updatedAt || 0) > (localItem.updatedAt || 0)) {
      merged.set(remoteItem.itemId, remoteItem);
    }
  });

  return Array.from(merged.values());
}

export function mergeBills(local: Bill[], remote: Bill[]): Bill[] {
  const merged = new Map<string, Bill>();

  // Add all local bills
  local.forEach(bill => merged.set(bill.billId, bill));

  // Merge remote bills using last-write-wins
  remote.forEach(remoteBill => {
    const localBill = merged.get(remoteBill.billId);
    if (!localBill || (remoteBill.updatedAt || 0) > (localBill.updatedAt || 0)) {
      merged.set(remoteBill.billId, remoteBill);
    }
  });

  return Array.from(merged.values());
}

export function mergeBillItems(local: BillItem[], remote: BillItem[]): BillItem[] {
  const merged = new Map<string, BillItem>();

  // Add all local bill items
  local.forEach(item => merged.set(item.itemId, item));

  // Merge remote bill items using last-write-wins
  remote.forEach(remoteItem => {
    const localItem = merged.get(remoteItem.itemId);
    if (!localItem || (remoteItem.updatedAt || 0) > (localItem.updatedAt || 0)) {
      merged.set(remoteItem.itemId, remoteItem);
    }
  });

  return Array.from(merged.values());
}

export function mergeSettings(local: Settings | null, remote: Settings | null): Settings | null {
  if (!local && !remote) return null;
  if (!local) return remote;
  if (!remote) return local;

  // Last-write-wins based on updatedAt
  return (remote.updatedAt || 0) > (local.updatedAt || 0) ? remote : local;
}
