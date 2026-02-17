import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Eye } from 'lucide-react';
import { generateBillNumber } from '@/billing/billNumber';
import { calculateItemTotal, calculateBillTotal } from '@/billing/calc';
import { getCategories, getItems } from '@/storage/repositories';
import { useSettings } from '@/settings/useSettings';
import type { BillItem } from '@/models/types';
import { toast } from 'sonner';

export default function CreateBillPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [billNumber, setBillNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [itemMaster, setItemMaster] = useState<any[]>([]);

  useEffect(() => {
    const initBill = async () => {
      const newBillNumber = await generateBillNumber();
      setBillNumber(newBillNumber);
      const cats = await getCategories();
      const itms = await getItems();
      setCategories(cats);
      setItemMaster(itms);
    };
    initBill();
  }, []);

  const addItem = () => {
    const newItem: BillItem = {
      itemId: Date.now().toString(),
      billId: '',
      description: '',
      descriptionMode: 'catalogue',
      basePrice: 0,
      quantity: 1,
      discount: 0,
      gst: settings.defaultGst || 0,
      totalPrice: 0,
      updatedAt: Date.now(),
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.itemId !== itemId));
  };

  const updateItem = (itemId: string, field: keyof BillItem, value: any) => {
    setItems(items.map(item => {
      if (item.itemId === itemId) {
        const updated = { ...item, [field]: value, updatedAt: Date.now() };
        
        // Auto-fill from item master when in catalogue mode
        if (field === 'description' && item.descriptionMode === 'catalogue') {
          const masterItem = itemMaster.find(m => m.itemName === value);
          if (masterItem) {
            updated.basePrice = masterItem.basePrice;
            updated.gst = masterItem.gstPercentage;
            updated.catalogueItemId = masterItem.itemId;
          }
        }
        
        // Recalculate total
        updated.totalPrice = calculateItemTotal(
          updated.basePrice,
          updated.quantity,
          updated.discount,
          updated.gst
        );
        
        return updated;
      }
      return item;
    }));
  };

  const toggleDescriptionMode = (itemId: string) => {
    setItems(items.map(item => {
      if (item.itemId === itemId) {
        const newMode = item.descriptionMode === 'catalogue' ? 'manual' : 'catalogue';
        return {
          ...item,
          descriptionMode: newMode,
          description: '',
          catalogueItemId: undefined,
          updatedAt: Date.now(),
        };
      }
      return item;
    }));
  };

  const handlePreview = () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate that all items have descriptions
    const emptyDescriptions = items.filter(item => !item.description.trim());
    if (emptyDescriptions.length > 0) {
      toast.error('Please enter description for all items');
      return;
    }

    const billData = {
      billNumber,
      customerName,
      phone,
      address,
      date,
      items,
      totalAmount: calculateBillTotal(items),
    };

    localStorage.setItem('currentBillDraft', JSON.stringify(billData));
    navigate({ to: '/bill-preview/$billId', params: { billId: 'draft' } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Bill</h1>
        <p className="text-muted-foreground">Generate a new bill for your customer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billNumber">Bill Number</Label>
              <Input
                id="billNumber"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Sl.</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Price</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-24">Disc %</TableHead>
                    <TableHead className="w-20">GST %</TableHead>
                    <TableHead className="w-28">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.itemId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={item.descriptionMode}
                            onValueChange={() => toggleDescriptionMode(item.itemId)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="catalogue">From Catalogue</SelectItem>
                              <SelectItem value="manual">Manual Entry</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {item.descriptionMode === 'catalogue' ? (
                            <Select
                              value={item.description}
                              onValueChange={(value) => updateItem(item.itemId, 'description', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemMaster.map((masterItem) => (
                                  <SelectItem key={masterItem.itemId} value={masterItem.itemName}>
                                    {masterItem.itemName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(item.itemId, 'description', e.target.value)}
                              placeholder="Enter item description"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.basePrice}
                          onChange={(e) => updateItem(item.itemId, 'basePrice', parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.itemId, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.itemId, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full"
                          min="0"
                          max="100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.gst}
                          onChange={(e) => updateItem(item.itemId, 'gst', parseFloat(e.target.value) || 0)}
                          className="w-full"
                          min="0"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₹{item.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.itemId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {items.length > 0 && (
            <div className="mt-6 flex justify-between items-center border-t pt-4">
              <div className="text-lg font-semibold">Grand Total:</div>
              <div className="text-2xl font-bold text-primary">
                ₹{calculateBillTotal(items).toFixed(2)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
          Cancel
        </Button>
        <Button onClick={handlePreview} disabled={items.length === 0}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Bill
        </Button>
      </div>
    </div>
  );
}
