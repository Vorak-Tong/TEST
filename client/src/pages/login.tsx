import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Store } from "lucide-react";
import { login as loginApi } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const user = await loginApi(data);
      login(user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Store className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-secondary mb-2">G1 Supermarket</h1>
            <p className="text-gray-600">Management System</p>
          </div>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...form.register("username")}
                className="mt-2"
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
                placeholder="Enter your password"
                {...form.register("password")}
                className="mt-2"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-error mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="text-sm text-primary">
                Forgot password?
              </Button>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Role-based access for</p>
            <div className="flex justify-center space-x-2 mt-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Administrator
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Backend Dev
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                Business Analyst
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Demo credentials:</p>
            <p>admin/admin123 • backend_dev/backend123 • biz_analyst/analyst123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
