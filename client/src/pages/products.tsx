import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Tag, 
  DollarSign, 
  Layers,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a valid positive number"),
  categoryId: z.number().min(1, "Please select a category"),
  brand: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      categoryId: 0,
      brand: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductForm) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been successfully added.",
      });
      setShowAddModal(false);
      form.reset();
      setSelectedCategory("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      await apiRequest("PUT", `/api/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      setEditingProduct(null);
      form.reset();
      setSelectedCategory("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = productsLoading || categoriesLoading || inventoryLoading;

  // Create maps for easy lookup
  const categoryMap = new Map(categories?.map((c: any) => [c.id, c]) || []);
  
  // Calculate inventory totals per product
  const inventoryMap = inventory?.reduce((acc: any, item: any) => {
    acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    return acc;
  }, {}) || {};

  // Enrich products with category and inventory info
  const enrichedProducts = products?.map((product: any) => {
    const category = categoryMap.get(product.categoryId);
    const totalStock = inventoryMap[product.id] || 0;
    
    return {
      ...product,
      category,
      totalStock,
      stockStatus: totalStock === 0 ? 'out-of-stock' : totalStock < 10 ? 'low-stock' : 'in-stock'
    };
  }) || [];

  // Filter products
  const filteredProducts = enrichedProducts.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categoryId.toString() === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const onSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setValue("categoryId", parseInt(categoryId));
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.setValue("name", product.name);
    form.setValue("price", product.price);
    form.setValue("categoryId", product.categoryId);
    form.setValue("brand", product.brand || "");
    setSelectedCategory(product.categoryId.toString());
  };

  const handleDeleteProduct = (product: any) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    form.reset();
    setSelectedCategory("");
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

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;
  const lowStockProducts = enrichedProducts.filter(p => p.stockStatus === 'low-stock').length;
  const outOfStockProducts = enrichedProducts.filter(p => p.stockStatus === 'out-of-stock').length;

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="page-title">Product Management</h2>
                <p className="page-subtitle">Manage your product catalog and inventory</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Product Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Products</p>
                    <p className="text-2xl font-bold text-secondary">{totalProducts}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Categories</p>
                    <p className="text-2xl font-bold text-secondary">{totalCategories}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Layers className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                    <p className="text-2xl font-bold text-secondary">{lowStockProducts}</p>
                  </div>
                  <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Tag className="text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
                    <p className="text-2xl font-bold text-secondary">{outOfStockProducts}</p>
                  </div>
                  <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <DollarSign className="text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
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
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Product</th>
                        <th className="text-left py-3 px-4 font-medium">Category</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium">Stock</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product: any) => (
                        <tr key={product.id} className="border-b">
                          <td className="py-4 px-4">
                            <div className="font-medium text-secondary">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand || 'No brand'}</div>
                          </td>
                          <td className="py-4 px-4">
                            {product.category && getCategoryBadge(product.category.name)}
                          </td>
                          <td className="py-4 px-4 text-gray-900">${product.price}</td>
                          <td className="py-4 px-4 text-gray-900">{product.totalStock} units</td>
                          <td className="py-4 px-4">
                            {getStockBadge(product.stockStatus)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                                className="text-error hover:text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No products found matching your criteria.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddModal || !!editingProduct} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Enter price"
                {...form.register("price")}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                placeholder="Enter brand name"
                {...form.register("brand")}
              />
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending
                  ? (editingProduct ? 'Updating...' : 'Creating...')
                  : (editingProduct ? 'Update Product' : 'Add Product')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
