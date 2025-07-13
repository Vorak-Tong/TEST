import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BranchChartProps {
  data: any;
  isLoading: boolean;
}

export function BranchChart({ data, isLoading }: BranchChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use real data if available, otherwise mock data
  const chartData = data && data.length > 0 ? data.map((branch: any) => ({
    name: branch.branchName,
    sales: branch.totalSales,
    orders: branch.totalOrders,
  })) : [
    { name: 'Central Market', sales: 12400, orders: 45 },
    { name: 'Riverside', sales: 8200, orders: 32 },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#1976D2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
