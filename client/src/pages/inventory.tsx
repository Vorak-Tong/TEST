import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Search,
  Edit,
  Plus
} from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventoryimport { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  DollarSign,
  Search,
  Edit,
  Plus
} from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["/api/branches"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: inventoryStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/inventory"],
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ branchId, productId, quantity }: { branchId: number; productId: number; quantity: number }) => {
      await apiRequest("PUT", `/api/inventory/${branchId}/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/inventory"] });
      toast({
        title: "Inventory updated",
        description: "The inventory quantity has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = inventoryLoading || productsLoading || branchesLoading || categoriesLoading || statsLoading;

  // Create a map of products and branches for easy lookup
  const productMap = new Map(products?.map((p: any) => [p.id, p]) || []);
  const branchMap = new Map(branches?.map((b: any) => [b.id, b]) || []);
  const categoryMap = new Map(categories?.map((c: any) => [c.id, c]) || []);

  // Enrich inventory data with product and branch information
  const enrichedInventory = inventory?.map((item: any) => {
    const product = productMap.get(item.productId);
    const branch = branchMap.get(item.branchId);
    const category = product ? categoryMap.get(product.categoryId) : null;
    
    return {
      ...item,
      product,
      branch,
      category,
      status: item.quantity === 0 ? 'out-of-stock' : item.quantity < 10 ? 'low-stock' : 'in-stock'
    };
  }) || [];

  // Filter inventory based on search and filters
  const filteredInventory = enrichedInventory.filter((item: any) => {
    const matchesSearch = item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.branch?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === "all" || item.branchId.toString() === branchFilter;
    const matchesCategory = categoryFilter === "all" || item.product?.categoryId.toString() === categoryFilter;
    
    return matchesSearch && matchesBranch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-red-100 text-red-800">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-gray-100 text-gray-800">Out of Stock</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getCategoryBadge = (categoryName: string) => {
    const colors = {
      'Beverages': 'bg-blue-100 text-blue-800',
      'Snacks': 'bg-purple-100 text-purple-800',
      'Dairy': 'bg-yellow-100 text-yellow-800',
      'Produce': 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[categoryName as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {categoryName}
      </Badge>
    );
  };

  const handleUpdateQuantity = (branchId: number, productId: number, currentQuantity: number) => {
    const newQuantity = prompt(`Enter new quantity for this product:`, currentQuantity.toString());
    if (newQuantity !== null && !isNaN(parseInt(newQuantity))) {
      updateInventoryMutation.mutate({
        branchId,
        productId,
        quantity: parseInt(newQuantity)
      });
    }
  };

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <h2 className="page-title">Inventory Management</h2>
            <p className="page-subtitle">Track stock levels across all branches</p>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-secondary">
                      {inventoryStats?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Package className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                    <p className="text-2xl font-bold text-secondary">
                      {inventoryStats?.lowStockItems || 0}
                    </p>
                  </div>
                  <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <AlertTriangle className="text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                    <p className="text-2xl font-bold text-secondary">
                      {inventoryStats?.outOfStockItems || 0}
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <XCircle className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-secondary">
                      ${inventoryStats?.totalInventoryValue?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <DollarSign className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
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
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading inventory...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Product</th>
                        <th className="text-left py-3 px-4 font-medium">Branch</th>
                        <th className="text-left py-3 px-4 font-medium">Stock</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item: any) => (
                        <tr key={`${item.branchId}-${item.productId}`} className="border-b">
                          <td className="py-4 px-4">
                            <div className="font-medium text-secondary">{item.product?.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.category && getCategoryBadge(item.category.name)} • {item.product?.brand}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-900">{item.branch?.name}</td>
                          <td className="py-4 px-4 text-gray-900">{item.quantity} units</td>
                          <td className="py-4 px-4 text-gray-900">${item.product?.price}</td>
                          <td className="py-4 px-4">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.branchId, item.productId, item.quantity)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredInventory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No inventory items found matching your criteria.
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
