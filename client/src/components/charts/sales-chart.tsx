import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: any;
  isLoading: boolean;
}

export function SalesChart({ data, isLoading }: SalesChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock data for chart demonstration
  const chartData = [
    { month: 'Jan', sales: 2400 },
    { month: 'Feb', sales: 1398 },
    { month: 'Mar', sales: 9800 },
    { month: 'Apr', sales: 3908 },
    { month: 'May', sales: 4800 },
    { month: 'Jun', sales: 3800 },
    { month: 'Jul', sales: 4300 },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#1976D2" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
