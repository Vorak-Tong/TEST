import { useAuth } from "./auth-provider";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { hasRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
              <h1 className="text-xl font-bold text-secondary mb-2">Access Denied</h1>
              <p className="text-gray-600">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Required roles: {allowedRoles.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
