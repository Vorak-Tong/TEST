import { apiRequest } from "./queryClient";
import type { AuthUser, LoginCredentials } from "@shared/schema";

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role.name);
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ["Administrator"]);
}

export function canManageUsers(user: AuthUser | null): boolean {
  return isAdmin(user);
}

export function canViewSales(user: AuthUser | null): boolean {
  return hasRole(user, ["Administrator", "Business Analyst"]);
}

export function canManageInventory(user: AuthUser | null): boolean {
  return hasRole(user, ["Administrator", "Backend Developer"]);
}

export function canManageOrders(user: AuthUser | null): boolean {
  return hasRole(user, ["Administrator", "Backend Developer"]);
}

export function canManageBranches(user: AuthUser | null): boolean {
  return isAdmin(user);
}

export function canManageProducts(user: AuthUser | null): boolean {
  return hasRole(user, ["Administrator", "Backend Developer"]);
}
