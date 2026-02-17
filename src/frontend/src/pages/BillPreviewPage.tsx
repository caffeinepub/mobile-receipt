import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Printer, Save, ArrowLeft } from 'lucide-react';
import { useSettings } from '@/settings/useSettings';
import { numberToWords } from '@/billing/amountInWords';
import { generateBillPdf } from '@/pdf/generateBillPdf';
import { saveBill, saveBillItems, getBillById, getBillItemsByBillId, saveBillPdf } from '@/storage/repositories';
import { toast } from 'sonner';
import type { Bill, BillItem } from '@/models/types';

export default function BillPreviewPage() {
  const navigate = useNavigate();
  const { billId } = useParams({ from: '/bill-preview/$billId' });
  const { settings } = useSettings();
  const [billData, setBillData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillData();
  }, [billId]);

  const loadBillData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (billId === 'draft') {
        const draft = localStorage.getItem('currentBillDraft');
        if (draft) {
          setBillData(JSON.parse(draft));
        } else {
          setError('No draft bill found');
        }
      } else {
        // Load saved bill by ID
        const bill = await getBillById(billId);
        if (!bill) {
          setError('Bill not found');
          return;
        }

        const items = await getBillItemsByBillId(billId);
        
        // Reconstruct bill data in the format expected by the preview
        const reconstructedBillData = {
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

        setBillData(reconstructedBillData);
      }
    } catch (err) {
      console.error('Error loading bill:', err);
      setError('Failed to load bill data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!billData) return;

    try {
      const pdfBlob = await generateBillPdf(billData, settings);
      
      // Save bill without pdfPath (we'll store the blob separately)
      await saveBill({
        billId: billData.billId,
        billNumber: billData.billNumber,
        customerName: billData.customerName,
        phone: billData.phone,
        address: billData.address,
        date: billData.date,
        totalAmount: billData.totalAmount,
      });

      // Save bill items
      await saveBillItems(billData.items.map((item: any) => ({
        ...item,
        billId: billData.billId,
      })));

      // Persist PDF blob to IndexedDB
      await saveBillPdf(billData.billId, pdfBlob);

      toast.success('Bill saved successfully!');
      localStorage.removeItem('currentBillDraft');
      navigate({ to: '/saved-bills' });
    } catch (error) {
      toast.error('Failed to save bill');
      console.error(error);
    }
  };

  const handleDownload = async () => {
    if (!billData) return;
    
    try {
      const pdfBlob = await generateBillPdf(billData, settings);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bill_${billData.billNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error(error);
    }
  };

  const handlePrint = async () => {
    if (!billData) return;
    
    try {
      const pdfBlob = await generateBillPdf(billData, settings);
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (error) {
      toast.error('Failed to print');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading bill...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => navigate({ to: '/saved-bills' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Saved Bills
        </Button>
      </div>
    );
  }

  if (!billData) {
    return <div className="text-center py-12">No bill data available</div>;
  }

  const isDraft = billId === 'draft';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: isDraft ? '/create-bill' : '/saved-bills' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isDraft ? 'Back to Edit' : 'Back to Saved Bills'}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {isDraft && (
            <Button onClick={handleSaveAndGenerate}>
              <Save className="h-4 w-4 mr-2" />
              Save & Generate
            </Button>
          )}
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            {settings.companyLogo && (
              <img 
                src={settings.companyLogo} 
                alt="Company Logo" 
                className="h-20 w-20 mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold">{settings.companyName || 'Company Name'}</h1>
            <p className="text-muted-foreground">{settings.companyAddress || 'Company Address'}</p>
            <p className="text-muted-foreground">{settings.companyPhone || 'Phone Number'}</p>
          </div>

          {/* Customer & Bill Info */}
          <div className="grid grid-cols-2 gap-6 border-b pb-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{billData.customerName}</p>
              {billData.phone && <p className="text-sm text-muted-foreground">{billData.phone}</p>}
              {billData.address && <p className="text-sm text-muted-foreground">{billData.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm"><span className="font-semibold">Bill No:</span> {billData.billNumber}</p>
              <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(billData.date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sl.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Disc %</TableHead>
                  <TableHead className="text-right">GST %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billData.items.map((item: any, index: number) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">₹{item.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.discount}%</TableCell>
                    <TableCell className="text-right">{item.gst}%</TableCell>
                    <TableCell className="text-right font-semibold">₹{item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-semibold">Grand Total:</span>
              <span className="text-2xl font-bold text-primary">₹{billData.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground text-right">
              Amount in words: <span className="font-medium">{numberToWords(billData.totalAmount)}</span>
            </p>
          </div>

          {/* QR Code & Thank You */}
          <div className="border-t pt-6 text-center space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Scan to Pay</p>
              <img 
                src={settings.paymentQr || '/assets/generated/default-payment-qr.dim_512x512.png'} 
                alt="Payment QR Code" 
                className="h-32 w-32 mx-auto"
              />
            </div>
            <p className="text-lg font-semibold text-primary">Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
