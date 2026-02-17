import { getDB } from './localDb';
import type { Category, ItemMaster, Bill, BillItem } from '@/models/types';
import type { Settings } from '@/models/settings';

export async function getCategories(): Promise<Category[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.filter((c: Category) => !c.deleted));
    request.onerror = () => reject(request.error);
  });
}

export async function getAllCategoriesIncludingDeleted(): Promise<Category[]> {
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
    const categoryWithTimestamp = { ...category, updatedAt: Date.now() };
    const request = store.put(categoryWithTimestamp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function bulkUpsertCategories(categories: Category[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    
    let completed = 0;
    const total = categories.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    categories.forEach(category => {
      const request = store.put(category);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['categories'], 'readwrite');
    const store = transaction.objectStore('categories');
    const getRequest = store.get(categoryId);
    
    getRequest.onsuccess = () => {
      const category = getRequest.result;
      if (category) {
        category.deleted = true;
        category.updatedAt = Date.now();
        const putRequest = store.put(category);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function getItems(): Promise<ItemMaster[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.filter((i: ItemMaster) => !i.deleted));
    request.onerror = () => reject(request.error);
  });
}

export async function getAllItemsIncludingDeleted(): Promise<ItemMaster[]> {
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
    const itemWithTimestamp = { ...item, updatedAt: Date.now() };
    const request = store.put(itemWithTimestamp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function bulkUpsertItems(items: ItemMaster[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    
    let completed = 0;
    const total = items.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    items.forEach(item => {
      const request = store.put(item);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteItem(itemId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const getRequest = store.get(itemId);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.deleted = true;
        item.updatedAt = Date.now();
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function getBills(): Promise<Bill[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readonly');
    const store = transaction.objectStore('bills');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.filter((b: Bill) => !b.deleted));
    request.onerror = () => reject(request.error);
  });
}

export async function getAllBillsIncludingDeleted(): Promise<Bill[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readonly');
    const store = transaction.objectStore('bills');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getBillById(billId: string): Promise<Bill | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readonly');
    const store = transaction.objectStore('bills');
    const request = store.get(billId);
    request.onsuccess = () => {
      const bill = request.result;
      resolve(bill && !bill.deleted ? bill : null);
    };
    request.onerror = () => reject(new Error(`Failed to retrieve bill: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function saveBill(bill: Bill): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readwrite');
    const store = transaction.objectStore('bills');
    const billWithTimestamp = { ...bill, updatedAt: Date.now() };
    const request = store.put(billWithTimestamp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save bill: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function bulkUpsertBills(bills: Bill[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['bills'], 'readwrite');
    const store = transaction.objectStore('bills');
    
    let completed = 0;
    const total = bills.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    bills.forEach(bill => {
      const request = store.put(bill);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(new Error(`Failed to save bills: ${request.error?.message || 'Unknown error'}`));
    });
  });
}

export async function saveBillItems(items: BillItem[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readwrite');
    const store = transaction.objectStore('billItems');
    
    let completed = 0;
    const total = items.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    items.forEach(item => {
      const itemWithTimestamp = { ...item, updatedAt: Date.now() };
      const request = store.put(itemWithTimestamp);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(new Error(`Failed to save bill items: ${request.error?.message || 'Unknown error'}`));
    });
  });
}

export async function getBillItems(billId: string): Promise<BillItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readonly');
    const store = transaction.objectStore('billItems');
    const index = store.index('billId');
    const request = index.getAll(billId);
    request.onsuccess = () => resolve(request.result.filter((i: BillItem) => !i.deleted));
    request.onerror = () => reject(new Error(`Failed to retrieve bill items: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function getBillItemsByBillId(billId: string): Promise<BillItem[]> {
  return getBillItems(billId);
}

export async function getAllBillItems(): Promise<BillItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readonly');
    const store = transaction.objectStore('billItems');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.filter((i: BillItem) => !i.deleted));
    request.onerror = () => reject(new Error(`Failed to retrieve all bill items: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function getAllBillItemsIncludingDeleted(): Promise<BillItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readonly');
    const store = transaction.objectStore('billItems');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to retrieve all bill items: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function bulkUpsertBillItems(items: BillItem[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billItems'], 'readwrite');
    const store = transaction.objectStore('billItems');
    
    let completed = 0;
    const total = items.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    items.forEach(item => {
      const request = store.put(item);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(new Error(`Failed to save bill items: ${request.error?.message || 'Unknown error'}`));
    });
  });
}

export async function getSettings(): Promise<Settings | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('app-settings');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const settingsWithTimestamp = { ...settings, id: 'app-settings', updatedAt: Date.now() };
    const request = store.put(settingsWithTimestamp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// PDF Blob persistence functions
export async function saveBillPdf(billId: string, pdfBlob: Blob): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billPdfs'], 'readwrite');
    const store = transaction.objectStore('billPdfs');
    const request = store.put({ billId, pdfBlob });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save PDF: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function getBillPdf(billId: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billPdfs'], 'readonly');
    const store = transaction.objectStore('billPdfs');
    const request = store.get(billId);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.pdfBlob : null);
    };
    request.onerror = () => reject(new Error(`Failed to retrieve PDF: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function getAllBillPdfs(): Promise<Array<{ billId: string; pdfBlob: Blob }>> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billPdfs'], 'readonly');
    const store = transaction.objectStore('billPdfs');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to retrieve PDFs: ${request.error?.message || 'Unknown error'}`));
  });
}

export async function deleteBillPdf(billId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['billPdfs'], 'readwrite');
    const store = transaction.objectStore('billPdfs');
    const request = store.delete(billId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete PDF: ${request.error?.message || 'Unknown error'}`));
  });
}
