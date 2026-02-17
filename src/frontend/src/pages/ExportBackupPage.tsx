import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '@/export/xlsxExport';
import { getBills, getAllBillItems } from '@/storage/repositories';
import { useSettings } from '@/settings/useSettings';
import { toast } from 'sonner';

export default function ExportBackupPage() {
  const { settings } = useSettings();
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    const backup = localStorage.getItem('lastBackupTime');
    setLastBackup(backup);
  }, []);

  const handleExport = async (type: 'weekly' | 'monthly' | 'full') => {
    try {
      const bills = await getBills();
      const billItems = await getAllBillItems();
      
      const now = new Date();
      let filteredBills = bills;

      if (type === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredBills = bills.filter(b => new Date(b.date) >= weekAgo);
      } else if (type === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredBills = bills.filter(b => new Date(b.date) >= monthAgo);
      }

      await exportToExcel(filteredBills, billItems, type);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} export completed!`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    }
  };

  const handleManualBackup = async () => {
    try {
      const bills = await getBills();
      const billItems = await getAllBillItems();
      await exportToExcel(bills, billItems, 'backup');
      
      const now = new Date().toISOString();
      localStorage.setItem('lastBackupTime', now);
      setLastBackup(now);
      
      toast.success('Backup completed successfully!');
    } catch (error) {
      toast.error('Backup failed');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export & Backup</h1>
        <p className="text-muted-foreground">Export your data and manage backups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Excel Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleExport('weekly')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Export Last 7 Days
            </Button>
            <Button 
              onClick={() => handleExport('monthly')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Export Last 30 Days
            </Button>
            <Button 
              onClick={() => handleExport('full')} 
              variant="outline" 
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Transactions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Local Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Backup Frequency</p>
              <p className="font-semibold capitalize">{settings.backupFrequency || 'Manual'}</p>
            </div>
            {lastBackup && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="font-semibold">{new Date(lastBackup).toLocaleString()}</p>
              </div>
            )}
            <Button onClick={handleManualBackup} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Create Manual Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Exports & Backups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Excel exports include both bill-level and item-level details</p>
          <p>• All exports are saved as .xlsx files for easy viewing in Excel or Google Sheets</p>
          <p>• Backups include all your data: bills, items, categories, and settings</p>
          <p>• All data is stored locally on your device for offline access</p>
        </CardContent>
      </Card>
    </div>
  );
}
