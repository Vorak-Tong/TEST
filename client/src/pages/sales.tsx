import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/charts/sales-chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];

export default function SalesPage() {
  const [dateRange, setDateRange] = useState("7days");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/analytics/sales"],
  });

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["/api/branches"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categoryData = categories?.map((cat: any, index: number) => ({
    name: cat.name,
    value: Math.floor(Math.random() * 5000) + 1000,
    color: COLORS[index % COLORS.length]
  })) || [];

  const isLoading = salesLoading || branchesLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <h2 className="page-title">Sales Analytics</h2>
            <p className="page-subtitle">Track sales performance and revenue trends</p>
          </div>

          {/* Sales Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="3months">Last 3 months</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Branch</label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="mt-6">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart data={salesStats} isLoading={salesLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Product</th>
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                        <th className="text-left py-3 px-4 font-medium">Units Sold</th>
                        <th className="text-left py-3 px-4 font-medium">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesStats?.topSellingProducts?.map((product: any, index: number) => (
                        <tr key={product.productId} className="border-b">
                          <td className="py-4 px-4">
                            <div className="font-medium text-secondary">{product.productName}</div>
                            <div className="text-sm text-gray-500">Product #{product.productId}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              Category
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-gray-900">{product.totalSold}</td>
                          <td className="py-4 px-4 text-gray-900">${product.revenue.toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <span className="text-success flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              +{(Math.random() * 20).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No sales data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
