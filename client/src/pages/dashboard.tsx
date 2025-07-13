import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/charts/sales-chart";
import { BranchChart } from "@/components/charts/branch-chart";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  UserCheck,
  Store,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/analytics/sales"],
  });

  const { data: inventoryStats, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/analytics/inventory"],
  });

  const { data: branchStats, isLoading: branchLoading } = useQuery({
    queryKey: ["/api/analytics/branches"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const isLoading = salesLoading || inventoryLoading || branchLoading || ordersLoading || usersLoading;

  const todaysOrders = orders?.filter((order: any) => {
    const orderDate = new Date(order.orderDate);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  })?.length || 0;

  const activeUsers = users?.length || 0;

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <h2 className="page-title">Dashboard Overview</h2>
            <p className="page-subtitle">Welcome back! Here's what's happening in your supermarket system.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-secondary">
                      ${salesStats?.totalSales?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-success mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <DollarSign className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-secondary">{activeUsers}</p>
                    <p className="text-sm text-success mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +8.2% from last week
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Orders Today</p>
                    <p className="text-2xl font-bold text-secondary">{todaysOrders}</p>
                    <p className="text-sm text-warning mt-1 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      -3.1% from yesterday
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <ShoppingCart className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                    <p className="text-2xl font-bold text-secondary">
                      {inventoryStats?.lowStockItems || 0}
                    </p>
                    <p className="text-sm text-error mt-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Needs attention
                    </p>
                  </div>
                  <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Package className="text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesStats} isLoading={salesLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <BranchChart data={branchStats} isLoading={branchLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
                    <UserCheck className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">New user registered</p>
                    <p className="text-xs text-gray-600">john.doe@email.com joined as Business Analyst</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
                    <ShoppingCart className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">Large order processed</p>
                    <p className="text-xs text-gray-600">Order #{todaysOrders + 100} - $1,245.50 at Central Market Branch</p>
                  </div>
                  <span className="text-xs text-gray-500">4 hours ago</span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-red-100 rounded-full w-10 h-10 flex items-center justify-center">
                    <AlertTriangle className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary">Low stock alert</p>
                    <p className="text-xs text-gray-600">Milk 1L - Only 5 units left in Riverside Branch</p>
                  </div>
                  <span className="text-xs text-gray-500">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
