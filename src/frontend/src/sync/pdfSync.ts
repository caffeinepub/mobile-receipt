import { ExternalBlob } from '@/backend';

export async function blobToExternalBlob(blob: Blob, onProgress?: (percentage: number) => void): Promise<ExternalBlob> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const externalBlob = ExternalBlob.fromBytes(uint8Array);
  
  if (onProgress) {
    return externalBlob.withUploadProgress(onProgress);
  }
  
  return externalBlob;
}

export async function externalBlobToBlob(externalBlob: ExternalBlob): Promise<Blob> {
  const bytes = await externalBlob.getBytes();
  return new Blob([bytes], { type: 'application/pdf' });
}
