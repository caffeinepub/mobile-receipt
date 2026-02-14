import { getDB } from './localDb';
import type { Category, ItemMaster, Bill, BillItem } from '@/models/types';
import type { Settings } from '@/models/settings';

export async function getCategories(): Promise<Category[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.put(category);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    const request = store.delete(categoryId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getItems(): Promise<ItemMaster[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveItem(item: ItemMaster): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteItem(itemId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.delete(itemId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBills(): Promise<Bill[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readonly');
    const store = transaction.objectStore('bills');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBill(bill: Bill): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const billId = bill.billId || Date.now().toString();
    const transaction = db.transaction(['bills', 'billItems'], 'readwrite');
    const billStore = transaction.objectStore('bills');
    const itemStore = transaction.objectStore('billItems');
    
    const billRequest = billStore.put({ ...bill, billId });
    
    billRequest.onsuccess = () => {
      // Save bill items if they exist in the bill data
      if ((bill as any).items) {
        const items = (bill as any).items;
        let completed = 0;
        items.forEach((item: BillItem) => {
          const itemRequest = itemStore.put({ ...item, billId });
          itemRequest.onsuccess = () => {
            completed++;
            if (completed === items.length) {
              resolve();
            }
          };
          itemRequest.onerror = () => reject(itemRequest.error);
        });
        if (items.length === 0) resolve();
      } else {
        resolve();
      }
    };
    
    billRequest.onerror = () => reject(billRequest.error);
  });
}

export async function getBillItems(): Promise<BillItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readonly');
    const store = transaction.objectStore('billItems');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSettings(): Promise<Settings | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('main');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ ...settings, id: 'main' });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
