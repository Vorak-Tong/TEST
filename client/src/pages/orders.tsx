import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp,
  Search,
  Eye,
  Calendar
} from "lucide-react";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["/api/branches"],
  });

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/analytics/sales"],
  });

  const isLoading = ordersLoading || branchesLoading || customersLoading || paymentsLoading || salesLoading;

  // Create maps for easy lookup
  const branchMap = new Map(branches?.map((b: any) => [b.id, b]) || []);
  const customerMap = new Map(customers?.map((c: any) => [c.id, c]) || []);
  const paymentMap = new Map(payments?.map((p: any) => [p.orderId, p]) || []);

  // Enrich orders with related data
  const enrichedOrders = orders?.map((order: any) => {
    const branch = branchMap.get(order.branchId);
    const customer = customerMap.get(order.customerId);
    const payment = paymentMap.get(order.id);
    
    return {
      ...order,
      branch,
      customer,
      payment,
      status: payment ? 'completed' : 'pending',
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Walk-in Customer'
    };
  }) || [];

  // Filter orders
  const filteredOrders = enrichedOrders.filter((order: any) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    const matchesBranch = branchFilter === "all" || order.branchId.toString() === branchFilter;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const completedOrders = enrichedOrders.filter(o => o.status === 'completed').length;
  const pendingOrders = enrichedOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = salesStats?.totalSales || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = (orderId: number) => {
    // In a real app, this would navigate to order details page
    alert(`View order details for Order #${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <h2 className="page-title">Orders Management</h2>
            <p className="page-subtitle">Track and manage customer orders</p>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-secondary">{totalOrders}</p>
                  </div>
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <ShoppingCart className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-secondary">{completedOrders}</p>
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Package className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-secondary">{pendingOrders}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Calendar className="text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-secondary">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <DollarSign className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading orders...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Branch</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Payment Method</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order: any) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-4 px-4">
                            <div className="font-medium text-secondary">#{order.id}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-secondary">{order.customerName}</div>
                            {order.customer && (
                              <div className="text-sm text-gray-500">{order.customer.email}</div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-900">{order.branch?.name}</td>
                          <td className="py-4 px-4 text-gray-900">{formatDate(order.orderDate)}</td>
                          <td className="py-4 px-4 text-gray-900">
                            {order.payment?.paymentMethod || 'Not specified'}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No orders found matching your criteria.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
