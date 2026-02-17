import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Download, FileText, RefreshCw } from 'lucide-react';
import { getBillPdf, getBillById, getBillItemsByBillId, saveBillPdf } from '@/storage/repositories';
import { generateBillPdf } from '@/pdf/generateBillPdf';
import { useSettings } from '@/settings/useSettings';
import { useLocalBills } from '@/hooks/useLocalBills';
import { toast } from 'sonner';
import type { Bill } from '@/models/types';
import { useState } from 'react';

export default function SavedBillsPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { bills, invalidate } = useLocalBills();
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [regeneratingPdf, setRegeneratingPdf] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bills.filter(bill => 
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBills(filtered);
    } else {
      setFilteredBills(bills);
    }
  }, [searchTerm, bills]);

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setDialogOpen(true);
  };

  const handleViewBillPreview = (bill: Bill) => {
    navigate({ to: '/bill-preview/$billId', params: { billId: bill.billId } });
  };

  const regeneratePdf = async (billId: string): Promise<Blob | null> => {
    try {
      setRegeneratingPdf(billId);
      
      const bill = await getBillById(billId);
      if (!bill) {
        toast.error('Bill not found');
        return null;
      }

      const items = await getBillItemsByBillId(billId);
      
      const billData = {
        billId: bill.billId,
        billNumber: bill.billNumber,
        customerName: bill.customerName,
        phone: bill.phone,
        address: bill.address,
        date: bill.date,
        totalAmount: bill.totalAmount,
        items: items.map(item => ({
          itemId: item.itemId,
          description: item.description,
          basePrice: item.basePrice,
          quantity: item.quantity,
          discount: item.discount,
          gst: item.gst,
          totalPrice: item.totalPrice,
        })),
      };

      const pdfBlob = await generateBillPdf(billData, settings);
      await saveBillPdf(billId, pdfBlob);
      
      toast.success('PDF regenerated successfully');
      return pdfBlob;
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      toast.error('Failed to regenerate PDF');
      return null;
    } finally {
      setRegeneratingPdf(null);
    }
  };

  const handleOpenPdf = async (bill: Bill) => {
    try {
      let pdfBlob = await getBillPdf(bill.billId);
      
      if (!pdfBlob) {
        toast.info('PDF not found. Regenerating...');
        pdfBlob = await regeneratePdf(bill.billId);
        if (!pdfBlob) return;
      }

      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.error('Failed to open PDF. Please try regenerating it.');
    }
  };

  const handleDownloadPdf = async (bill: Bill) => {
    try {
      let pdfBlob = await getBillPdf(bill.billId);
      
      if (!pdfBlob) {
        toast.info('PDF not found. Regenerating...');
        pdfBlob = await regeneratePdf(bill.billId);
        if (!pdfBlob) return;
      }

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bill_${bill.billNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try regenerating it.');
    }
  };

  const handleRegeneratePdf = async (bill: Bill) => {
    await regeneratePdf(bill.billId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Bills</h1>
        <p className="text-muted-foreground">View and manage all your transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by bill number or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm ? 'No bills found matching your search.' : 'No bills saved yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.billId}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.phone || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">₹{bill.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBill(bill)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBillPreview(bill)}
                            title="View Bill Preview"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPdf(bill)}
                            title="Download PDF"
                            disabled={regeneratingPdf === bill.billId}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegeneratePdf(bill)}
                            title="Regenerate PDF"
                            disabled={regeneratingPdf === bill.billId}
                          >
                            <RefreshCw className={`h-4 w-4 ${regeneratingPdf === bill.billId ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bill Number</p>
                  <p className="text-lg font-semibold">{selectedBill.billNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-lg">{new Date(selectedBill.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                  <p className="text-lg">{selectedBill.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{selectedBill.phone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-lg">{selectedBill.address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">₹{selectedBill.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
