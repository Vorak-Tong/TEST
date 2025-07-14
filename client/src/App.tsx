import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query.";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import SalesPage from "@/pages/sales";
import InventoryPage from "@/pages/inventory";
import OrdersPage from "@/pages/orders";
import BranchesPage from "@/pages/branches";
import ProductsPage from "@/pages/products";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute allowedRoles={["Administrator"]}>
          <UsersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/sales">
        <ProtectedRoute allowedRoles={["Administrator", "Business Analyst"]}>
          <SalesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute allowedRoles={["Administrator", "Backend Developer"]}>
          <InventoryPage />
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute allowedRoles={["Administrator", "Backend Developer"]}>
          <OrdersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/branches">
        <ProtectedRoute allowedRoles={["Administrator"]}>
          <BranchesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute allowedRoles={["Administrator", "Backend Developer"]}>
          <ProductsPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
