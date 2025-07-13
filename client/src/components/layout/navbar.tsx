import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Store } from "lucide-react";
import { logout as logoutApi } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-surface shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary rounded-lg w-10 h-10 flex items-center justify-center">
            <Store className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary">G1 Supermarket</h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              3
            </span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-secondary">{user.username}</p>
              <p className="text-xs text-gray-600">{user.role.name}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
