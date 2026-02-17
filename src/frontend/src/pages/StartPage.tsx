import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { APP_NAME } from '@/constants/app';

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-12 pb-8 px-8 text-center">
          <div className="mb-8 flex justify-center">
            <img 
              src="/assets/generated/mobile-receipt-logo.dim_512x512.png" 
              alt={`${APP_NAME} Logo`}
              className="h-32 w-32 rounded-2xl shadow-md"
            />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Your complete offline billing solution for small businesses
          </p>
          <div className="space-y-3 text-left mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Create professional bills with ease</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Track sales and analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Generate PDF receipts instantly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Works completely offline</span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="w-full text-lg h-12"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
