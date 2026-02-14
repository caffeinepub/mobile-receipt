export interface Settings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyLogo?: string;
  paymentQr?: string;
  defaultGst: number;
  backupFrequency: 'manual' | 'daily' | 'weekly' | 'monthly';
}

export const defaultSettings: Settings = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  defaultGst: 0,
  backupFrequency: 'manual',
};
