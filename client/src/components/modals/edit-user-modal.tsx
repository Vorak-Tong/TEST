import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { AuthUser, Role } from "@shared/schema";

const editUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  roleId: z.number().min(1, "Please select a role"),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  roles: Role[];
}

export function EditUserModal({ isOpen, onClose, user, roles }: EditUserModalProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      roleId: 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("username", user.username);
      form.setValue("roleId", user.role.id);
      setSelectedRole(user.role.id.toString());
    }
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: async (userData: EditUserForm) => {
      if (!user) return;
      await apiRequest("PUT", `/api/users/${user.id}`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditUserForm) => {
    updateUserMutation.mutate(data);
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    form.setValue("roleId", parseInt(roleId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              placeholder="Enter username"
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.roleId && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.roleId.message}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
