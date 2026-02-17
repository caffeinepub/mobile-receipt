export interface Settings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  defaultGst: number;
  backupFrequency: 'manual' | 'daily' | 'weekly' | 'monthly';
  companyLogo: string;
  paymentQr: string;
  updatedAt?: number;
  autoSyncEnabled?: boolean;
  lastSyncAt?: number;
}

export const defaultSettings: Settings = {
  companyName: 'Mobile Receipt',
  companyAddress: '',
  companyPhone: '',
  defaultGst: 0,
  backupFrequency: 'manual',
  companyLogo: '/assets/generated/mobile-receipt-logo.dim_512x512.png',
  paymentQr: '/assets/generated/default-payment-qr.dim_512x512.png',
  autoSyncEnabled: false,
};
