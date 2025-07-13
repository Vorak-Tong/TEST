import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building,
  Boxes,
  ShoppingCart,
  Users,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { canManageUsers, canViewSales, canManageInventory, canManageOrders, canManageBranches, canManageProducts } from "@/lib/auth";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresRole: () => true },
  { path: "/sales", label: "Sales Analytics", icon: BarChart3, requiresRole: canViewSales },
  { path: "/inventory", label: "Inventory", icon: Boxes, requiresRole: canManageInventory },
  { path: "/orders", label: "Orders", icon: ShoppingCart, requiresRole: canManageOrders },
  { path: "/users", label: "User Management", icon: Users, requiresRole: canManageUsers },
  { path: "/branches", label: "Branches", icon: Building, requiresRole: canManageBranches },
  { path: "/products", label: "Products", icon: Package, requiresRole: canManageProducts },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const visibleItems = navigationItems.filter(item => item.requiresRole(user));

  return (
    <aside className="w-64 bg-surface shadow-sm min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-blue-50 text-primary"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">Role-based Access Control</p>
          <div className="mt-2 flex justify-center">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
              {user.role.name}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
