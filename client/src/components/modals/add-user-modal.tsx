import { useState } from "react";
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
import type { Role } from "@shared/schema";

const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.number().min(1, "Please select a role"),
});

type AddUserForm = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
}

export function AddUserModal({ isOpen, onClose, roles }: AddUserModalProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const form = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      passwordHash: "",
      roleId: 0,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: AddUserForm) => {
      await apiRequest("POST", "/api/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User created",
        description: "The user has been successfully added to the system.",
      });
      onClose();
      form.reset();
      setSelectedRole("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddUserForm) => {
    createUserMutation.mutate(data);
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    form.setValue("roleId", parseInt(roleId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              {...form.register("passwordHash")}
            />
            {form.formState.errors.passwordHash && (
              <p className="text-sm text-error mt-1">
                {form.formState.errors.passwordHash.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
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
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
