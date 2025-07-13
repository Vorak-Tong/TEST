import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  MapPin, 
  Phone, 
  DollarSign,
  ShoppingCart,
  Users,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";

const branchSchema = z.object({
  name: z.string().min(3, "Branch name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

type BranchForm = z.infer<typeof branchSchema>;

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const { toast } = useToast();

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["/api/branches"],
  });

  const { data: branchStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/branches"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const form = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      location: "",
      phone: "",
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (branchData: BranchForm) => {
      await apiRequest("POST", "/api/branches", branchData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/branches"] });
      toast({
        title: "Branch created",
        description: "The branch has been successfully added.",
      });
      setShowAddModal(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BranchForm }) => {
      await apiRequest("PUT", `/api/branches/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/branches"] });
      toast({
        title: "Branch updated",
        description: "The branch has been successfully updated.",
      });
      setEditingBranch(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update branch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: async (branchId: number) => {
      await apiRequest("DELETE", `/api/branches/${branchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/branches"] });
      toast({
        title: "Branch deleted",
        description: "The branch has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = branchesLoading || statsLoading || employeesLoading;

  // Create stats map for easy lookup
  const statsMap = new Map(branchStats?.map((stat: any) => [stat.branchId, stat]) || []);

  // Count employees per branch
  const employeeCount = employees?.reduce((acc: any, emp: any) => {
    acc[emp.branchId] = (acc[emp.branchId] || 0) + 1;
    return acc;
  }, {}) || {};

  // Filter branches
  const filteredBranches = branches?.filter((branch: any) => {
    return branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           branch.location.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const onSubmit = (data: BranchForm) => {
    if (editingBranch) {
      updateBranchMutation.mutate({ id: editingBranch.id, data });
    } else {
      createBranchMutation.mutate(data);
    }
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    form.setValue("name", branch.name);
    form.setValue("location", branch.location);
    form.setValue("phone", branch.phone);
  };

  const handleDeleteBranch = (branch: any) => {
    if (window.confirm(`Are you sure you want to delete "${branch.name}"?`)) {
      deleteBranchMutation.mutate(branch.id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingBranch(null);
    form.reset();
  };

  const totalBranches = branches?.length || 0;
  const totalSales = branchStats?.reduce((sum: number, stat: any) => sum + stat.totalSales, 0) || 0;
  const totalOrders = branchStats?.reduce((sum: number, stat: any) => sum + stat.totalOrders, 0) || 0;
  const totalEmployees = employees?.length || 0;

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="page-title">Branch Management</h2>
                <p className="page-subtitle">Manage store locations and performance</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </div>
          </div>

          {/* Branch Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Branches</p>
                    <p className="text-2xl font-bold text-secondary">{totalBranches}</p>
                  </div>
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Building className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-secondary">${totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <DollarSign className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-secondary">{totalOrders}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <ShoppingCart className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                    <p className="text-2xl font-bold text-secondary">{totalEmployees}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Branches Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Branches</CardTitle>
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading branches...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBranches.map((branch: any) => {
                    const stats = statsMap.get(branch.id);
                    const empCount = employeeCount[branch.id] || 0;
                    
                    return (
                      <Card key={branch.id} className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-secondary">{branch.name}</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditBranch(branch)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBranch(branch)}
                                className="text-error hover:text-error"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {branch.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              {branch.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              {empCount} employees
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Sales</p>
                              <p className="text-lg font-semibold text-secondary">
                                ${stats?.totalSales?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Orders</p>
                              <p className="text-lg font-semibold text-secondary">
                                {stats?.totalOrders || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {filteredBranches.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  No branches found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add/Edit Branch Modal */}
      <Dialog open={showAddModal || !!editingBranch} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                placeholder="Enter branch name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter branch location"
                {...form.register("location")}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
              >
                {createBranchMutation.isPending || updateBranchMutation.isPending
                  ? (editingBranch ? 'Updating...' : 'Creating...')
                  : (editingBranch ? 'Update Branch' : 'Add Branch')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
