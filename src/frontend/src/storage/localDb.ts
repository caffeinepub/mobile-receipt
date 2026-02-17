interface IDBPDatabase {
  objectStoreNames: DOMStringList;
  createObjectStore(name: string, options?: IDBObjectStoreParameters): IDBObjectStore;
  transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction;
  close(): void;
}

const DB_NAME = 'MobileReceiptDB';
const DB_VERSION = 3;

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'categoryId' });
      }
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', { keyPath: 'itemId' });
      }
      if (!db.objectStoreNames.contains('bills')) {
        db.createObjectStore('bills', { keyPath: 'billId' });
      }
      if (!db.objectStoreNames.contains('billItems')) {
        const store = db.createObjectStore('billItems', { keyPath: 'itemId' });
        store.createIndex('billId', 'billId', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('billPdfs')) {
        db.createObjectStore('billPdfs', { keyPath: 'billId' });
      }

      // Add sync metadata to existing records if upgrading from v2
      if (oldVersion < 3) {
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const now = Date.now();

        // Add updatedAt to categories
        if (db.objectStoreNames.contains('categories')) {
          const catStore = transaction.objectStore('categories');
          const catRequest = catStore.openCursor();
          catRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (!record.updatedAt) {
                record.updatedAt = now;
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }

        // Add updatedAt to items
        if (db.objectStoreNames.contains('items')) {
          const itemStore = transaction.objectStore('items');
          const itemRequest = itemStore.openCursor();
          itemRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (!record.updatedAt) {
                record.updatedAt = now;
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }

        // Add updatedAt to bills
        if (db.objectStoreNames.contains('bills')) {
          const billStore = transaction.objectStore('bills');
          const billRequest = billStore.openCursor();
          billRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (!record.updatedAt) {
                record.updatedAt = now;
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }

        // Add updatedAt to billItems
        if (db.objectStoreNames.contains('billItems')) {
          const billItemStore = transaction.objectStore('billItems');
          const billItemRequest = billItemStore.openCursor();
          billItemRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (!record.updatedAt) {
                record.updatedAt = now;
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }

        // Add updatedAt to settings
        if (db.objectStoreNames.contains('settings')) {
          const settingsStore = transaction.objectStore('settings');
          const settingsRequest = settingsStore.get('app-settings');
          settingsRequest.onsuccess = () => {
            const settings = settingsRequest.result;
            if (settings && !settings.updatedAt) {
              settings.updatedAt = now;
              settingsStore.put(settings);
            }
          };
        }
      }
    };
  });
}

export async function getDB(): Promise<IDBDatabase> {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance!;
}
