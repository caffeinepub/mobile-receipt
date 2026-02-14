import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalBills } from '@/hooks/useLocalBills';
import { computeAnalytics } from '@/analytics/computeAnalytics';
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import SimpleCategoryChart from '@/components/charts/SimpleCategoryChart';
import SimpleProductChart from '@/components/charts/SimpleProductChart';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { bills, billItems } = useLocalBills();
  const analytics = computeAnalytics(bills, billItems);

  const summaryCards = [
    { title: 'Today', value: analytics.today, icon: DollarSign, color: 'text-chart-1' },
    { title: 'This Week', value: analytics.week, icon: TrendingUp, color: 'text-chart-2' },
    { title: 'This Month', value: analytics.month, icon: Calendar, color: 'text-chart-3' },
    { title: 'This Year', value: analytics.year, icon: Wallet, color: 'text-chart-4' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{card.value.toFixed(2)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={analytics.monthlySales} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleCategoryChart data={analytics.salesByCategory} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleProductChart data={analytics.salesByProduct} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
