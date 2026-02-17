import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories, getItems, saveCategory, saveItem, deleteCategory, deleteItem } from '@/storage/repositories';
import type { Category, ItemMaster } from '@/models/types';
import { toast } from 'sonner';

export default function ItemsCategoriesPage() {
  const queryClient = useQueryClient();
  
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: getItems,
  });

  const categories = categoriesQuery.data || [];
  const items = itemsQuery.data || [];

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  const [categoryName, setCategoryName] = useState('');
  const [itemName, setItemName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [gstPercentage, setGstPercentage] = useState('');

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Please enter category name');
      return;
    }

    const category: Category = {
      categoryId: editingCategory?.categoryId || Date.now().toString(),
      categoryName: categoryName.trim(),
      updatedAt: Date.now(),
    };

    await saveCategory(category);
    toast.success(editingCategory ? 'Category updated' : 'Category added');
    setCategoryDialogOpen(false);
    resetCategoryForm();
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const handleSaveItem = async () => {
    if (!itemName.trim() || !selectedCategoryId || !basePrice) {
      toast.error('Please fill all required fields');
      return;
    }

    const item: ItemMaster = {
      itemId: editingItem?.itemId || Date.now().toString(),
      itemName: itemName.trim(),
      categoryId: selectedCategoryId,
      basePrice: parseFloat(basePrice),
      gstPercentage: parseFloat(gstPercentage) || 0,
      updatedAt: Date.now(),
    };

    await saveItem(item);
    toast.success(editingItem ? 'Item updated' : 'Item added');
    setItemDialogOpen(false);
    resetItemForm();
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.categoryName);
    setCategoryDialogOpen(true);
  };

  const handleEditItem = (item: ItemMaster) => {
    setEditingItem(item);
    setItemName(item.itemName);
    setSelectedCategoryId(item.categoryId);
    setBasePrice(item.basePrice.toString());
    setGstPercentage(item.gstPercentage.toString());
    setItemDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(categoryId);
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemId);
      toast.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  };

  const resetCategoryForm = () => {
    setCategoryName('');
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemName('');
    setSelectedCategoryId('');
    setBasePrice('');
    setGstPercentage('');
    setEditingItem(null);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.categoryId === categoryId)?.categoryName || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Items & Categories</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Item Master</CardTitle>
              <Button onClick={() => { resetItemForm(); setItemDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Base Price</TableHead>
                        <TableHead className="text-right">GST %</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                          <TableCell className="text-right">₹{item.basePrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.gstPercentage}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.itemId)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categories</CardTitle>
              <Button onClick={() => { resetCategoryForm(); setCategoryDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No categories added yet. Click "Add Category" to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.categoryId}>
                          <TableCell className="font-medium">{category.categoryName}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.categoryId)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        </TabsContent>
      </Tabs>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCategoryDialogOpen(false); resetCategoryForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstPercentage">GST Percentage</Label>
              <Input
                id="gstPercentage"
                type="number"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setItemDialogOpen(false); resetItemForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
