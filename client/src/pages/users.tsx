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
import { AddUserModal } from "@/components/modals/add-user-modal";
import { EditUserModal } from "@/components/modals/edit-user-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Search
} from "lucide-react";
import type { AuthUser } from "@shared/schema";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: roles } = useQuery({
    queryKey: ["/api/roles"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "The user has been successfully removed from the system.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (user: AuthUser) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const filteredUsers = users?.filter((user: AuthUser) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.name === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "Administrator":
        return "bg-primary/10 text-primary";
      case "Backend Developer":
        return "bg-green-100 text-green-800";
      case "Business Analyst":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalUsers = users?.length || 0;
  const activeUsers = totalUsers; // In real app, this would be calculated based on user status
  const pendingActions = 3; // Mock data

  return (
    <div className="min-h-screen bg-background-page">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="page-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="page-title">User Management</h2>
                <p className="page-subtitle">Manage user accounts and permissions</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-secondary">{totalUsers}</p>
                  </div>
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="text-primary" />
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
                  </div>
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <UserCheck className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Actions</p>
                    <p className="text-2xl font-bold text-secondary">{pendingActions}</p>
                  </div>
                  <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Clock className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles?.map((role: any) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
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
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Last Login</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user: AuthUser) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-secondary">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.username}@g1supermarket.com</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getRoleBadgeColor(user.role.name)}>
                              {user.role.name}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {user.id === 1 ? "2 hours ago" : user.id === 2 ? "1 day ago" : "3 days ago"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
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
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found matching your criteria.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        roles={roles || []}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        roles={roles || []}
      />
    </div>
  );
}
