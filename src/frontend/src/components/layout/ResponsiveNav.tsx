import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, LayoutDashboard, FileText, Package, Settings, Download, Receipt } from 'lucide-react';
import { APP_NAME } from '@/constants/app';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create-bill', label: 'Create Bill', icon: FileText },
  { path: '/saved-bills', label: 'Transactions', icon: Receipt },
  { path: '/items-categories', label: 'Items', icon: Package },
  { path: '/export-backup', label: 'Export', icon: Download },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function ResponsiveNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation - Drawer */}
      <div className="md:hidden border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/mobile-receipt-logo.dim_512x512.png" alt={APP_NAME} className="h-8 w-8" />
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/assets/generated/mobile-receipt-logo.dim_512x512.png" alt={APP_NAME} className="h-10 w-10" />
                  <span className="font-bold text-xl">{APP_NAME}</span>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      className="justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation - Tabs */}
      <div className="hidden md:block border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6 mb-4">
            <img src="/assets/generated/mobile-receipt-logo.dim_512x512.png" alt={APP_NAME} className="h-10 w-10" />
            <span className="font-bold text-2xl">{APP_NAME}</span>
          </div>
          <Tabs value={location.pathname} onValueChange={(value) => navigate({ to: value })}>
            <TabsList className="w-full justify-start">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger key={item.path} value={item.path} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </>
  );
}
