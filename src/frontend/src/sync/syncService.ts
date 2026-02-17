import type { backendInterface } from '@/backend';
import {
  getAllCategoriesIncludingDeleted,
  getAllItemsIncludingDeleted,
  getAllBillsIncludingDeleted,
  getAllBillItemsIncludingDeleted,
  getSettings,
  getAllBillPdfs,
  bulkUpsertCategories,
  bulkUpsertItems,
  bulkUpsertBills,
  bulkUpsertBillItems,
  saveSettings,
  saveBillPdf,
} from '@/storage/repositories';
import {
  mergeCategories,
  mergeItems,
  mergeBills,
  mergeBillItems,
  mergeSettings,
} from './merge';
import {
  categoryToBackend,
  categoryFromBackend,
  itemToBackend,
  itemFromBackend,
  billToBackend,
  billFromBackend,
  settingsToBackend,
  settingsFromBackend,
} from './entityAdapters';
import { blobToExternalBlob, externalBlobToBlob } from './pdfSync';

export interface SyncProgress {
  stage: 'uploading' | 'downloading' | 'merging' | 'complete';
  message: string;
  percentage?: number;
}

export async function performSync(
  actor: backendInterface,
  onProgress?: (progress: SyncProgress) => void
): Promise<void> {
  try {
    // Stage 1: Upload local changes
    onProgress?.({ stage: 'uploading', message: 'Uploading local changes...', percentage: 10 });
    await uploadLocalChanges(actor);

    // Stage 2: Download remote data
    onProgress?.({ stage: 'downloading', message: 'Downloading remote data...', percentage: 40 });
    const remoteData = await downloadRemoteData(actor);

    // Stage 3: Merge data
    onProgress?.({ stage: 'merging', message: 'Merging data...', percentage: 70 });
    await mergeAndPersist(remoteData);

    // Stage 4: Sync PDFs
    onProgress?.({ stage: 'downloading', message: 'Syncing PDFs...', percentage: 90 });
    await syncPdfs(actor);

    onProgress?.({ stage: 'complete', message: 'Sync complete!', percentage: 100 });
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

async function uploadLocalChanges(actor: backendInterface): Promise<void> {
  // Upload categories
  const localCategories = await getAllCategoriesIncludingDeleted();
  for (const category of localCategories) {
    try {
      await actor.syncCategory(categoryToBackend(category));
    } catch (error) {
      console.error('Failed to sync category:', category.categoryId, error);
    }
  }

  // Upload items
  const localItems = await getAllItemsIncludingDeleted();
  for (const item of localItems) {
    try {
      await actor.syncItem(itemToBackend(item));
    } catch (error) {
      console.error('Failed to sync item:', item.itemId, error);
    }
  }

  // Upload bills
  const localBills = await getAllBillsIncludingDeleted();
  for (const bill of localBills) {
    try {
      await actor.syncBill(billToBackend(bill));
    } catch (error) {
      console.error('Failed to sync bill:', bill.billId, error);
    }
  }

  // Upload settings
  const localSettings = await getSettings();
  if (localSettings) {
    try {
      await actor.syncSettings(settingsToBackend(localSettings));
    } catch (error) {
      console.error('Failed to sync settings:', error);
    }
  }

  // Upload PDFs
  const localPdfs = await getAllBillPdfs();
  for (const { billId, pdfBlob } of localPdfs) {
    try {
      const externalBlob = await blobToExternalBlob(pdfBlob);
      await actor.uploadPdfBlob(billId, externalBlob);
    } catch (error) {
      console.error('Failed to upload PDF:', billId, error);
    }
  }
}

interface RemoteData {
  categories: ReturnType<typeof categoryFromBackend>[];
  items: ReturnType<typeof itemFromBackend>[];
  bills: ReturnType<typeof billFromBackend>[];
  settings: ReturnType<typeof settingsFromBackend> | null;
}

async function downloadRemoteData(actor: backendInterface): Promise<RemoteData> {
  const [remoteCategories, remoteItems, remoteBills, remoteSettings] = await Promise.all([
    actor.getCategories(),
    actor.getItems(),
    actor.getBills(),
    actor.getSettings(),
  ]);

  const localSettings = await getSettings();

  return {
    categories: remoteCategories.map(categoryFromBackend),
    items: remoteItems.map(itemFromBackend),
    bills: remoteBills.map(billFromBackend),
    settings: remoteSettings ? settingsFromBackend(remoteSettings, localSettings || {} as any) : null,
  };
}

async function mergeAndPersist(remoteData: RemoteData): Promise<void> {
  // Merge categories
  const localCategories = await getAllCategoriesIncludingDeleted();
  const mergedCategories = mergeCategories(localCategories, remoteData.categories);
  await bulkUpsertCategories(mergedCategories);

  // Merge items (preserve local gstPercentage)
  const localItems = await getAllItemsIncludingDeleted();
  const remoteItemsWithGst = remoteData.items.map(remoteItem => {
    const localItem = localItems.find(li => li.itemId === remoteItem.itemId);
    return {
      ...remoteItem,
      gstPercentage: localItem?.gstPercentage || 0,
    };
  });
  const mergedItems = mergeItems(localItems, remoteItemsWithGst);
  await bulkUpsertItems(mergedItems);

  // Merge bills (preserve local fields not in backend)
  const localBills = await getAllBillsIncludingDeleted();
  const remoteBillsWithLocalFields = remoteData.bills.map(remoteBill => {
    const localBill = localBills.find(lb => lb.billId === remoteBill.billId);
    return {
      ...remoteBill,
      billNumber: localBill?.billNumber || remoteBill.billNumber,
      customerName: localBill?.customerName || remoteBill.customerName,
      phone: localBill?.phone || remoteBill.phone,
      address: localBill?.address || remoteBill.address,
    };
  });
  const mergedBills = mergeBills(localBills, remoteBillsWithLocalFields);
  await bulkUpsertBills(mergedBills);

  // Merge bill items
  const localBillItems = await getAllBillItemsIncludingDeleted();
  const mergedBillItems = mergeBillItems(localBillItems, []);
  await bulkUpsertBillItems(mergedBillItems);

  // Merge settings
  const localSettings = await getSettings();
  const mergedSettings = mergeSettings(localSettings, remoteData.settings);
  if (mergedSettings) {
    await saveSettings(mergedSettings);
  }
}

async function syncPdfs(actor: backendInterface): Promise<void> {
  const localBills = await getAllBillsIncludingDeleted();
  
  for (const bill of localBills) {
    if (bill.deleted) continue;
    
    try {
      const remotePdf = await actor.getPdfBlob(bill.billId);
      if (remotePdf) {
        const pdfBlob = await externalBlobToBlob(remotePdf);
        await saveBillPdf(bill.billId, pdfBlob);
      }
    } catch (error) {
      console.error('Failed to download PDF:', bill.billId, error);
    }
  }
}
