import { mysqlTable, text, int, decimal, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users and Roles
export const roles = mysqlTable("roles", {
  id: int("role_id").primaryKey().autoincrement(),
  name: varchar("role_name", { length: 50 }).notNull().unique(),
  description: text("description"),
});

export const users = mysqlTable("users", {
  id: int("user_id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  roleId: int("role_id").notNull().references(() => roles.id),
});

// Product Categories
export const productCategories = mysqlTable("product_categories", {
  id: int("category_id").primaryKey().autoincrement(),
  name: varchar("category_name", { length: 100 }).notNull().unique(),
});

// Products
export const products = mysqlTable("products", {
  id: int("product_id").primaryKey().autoincrement(),
  name: varchar("product_name", { length: 150 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: int("category_id").notNull().references(() => productCategories.id),
  brand: varchar("brand", { length: 100 }),
});

// Branches
export const branches = mysqlTable("branches", {
  id: int("branch_id").primaryKey().autoincrement(),
  name: varchar("branch_name", { length: 100 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
});

// Branch Inventory
export const branchInventory = mysqlTable("branch_inventory", {
  branchId: int("branch_id").notNull().references(() => branches.id),
  productId: int("product_id").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
});

// Customers
export const customers = mysqlTable("customers", {
  id: int("customer_id").primaryKey().autoincrement(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
});

// Employees
export const employees = mysqlTable("employees", {
  id: int("employee_id").primaryKey().autoincrement(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  branchId: int("branch_id").references(() => branches.id),
});

// Orders
export const orders = mysqlTable("orders", {
  id: int("order_id").primaryKey().autoincrement(),
  customerId: int("customer_id").references(() => customers.id),
  branchId: int("branch_id").notNull().references(() => branches.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
});

// Order Items
export const orderItems = mysqlTable("order_items", {
  orderId: int("order_id").notNull().references(() => orders.id),
  productId: int("product_id").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

// Payments
export const payments = mysqlTable("payments", {
  id: int("payment_id").primaryKey().autoincrement(),
  orderId: int("order_id").notNull().unique().references(() => orders.id),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
});

// Suppliers
export const suppliers = mysqlTable("suppliers", {
  id: int("supplier_id").primaryKey().autoincrement(),
  name: varchar("supplier_name", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  address: varchar("address", { length: 255 }).notNull(),
});

// Restock Orders
export const restockOrders = mysqlTable("restock_orders", {
  id: int("restock_order_id").primaryKey().autoincrement(),
  supplierId: int("supplier_id").references(() => suppliers.id),
  branchId: int("branch_id").notNull().references(() => branches.id),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: varchar("status", { length: 50 }),
});

// Restock Items
export const restockItems = mysqlTable("restock_items", {
  restockOrderId: int("restock_order_id").notNull().references(() => restockOrders.id),
  productId: int("product_id").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const selectUserSchema = createSelectSchema(users);
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export const selectRoleSchema = createSelectSchema(roles);

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const selectProductSchema = createSelectSchema(products);
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true });
export const selectProductCategorySchema = createSelectSchema(productCategories);

export const insertBranchSchema = createInsertSchema(branches).omit({ id: true });
export const selectBranchSchema = createSelectSchema(branches);
export const insertBranchInventorySchema = createInsertSchema(branchInventory);
export const selectBranchInventorySchema = createSelectSchema(branchInventory);

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const selectCustomerSchema = createSelectSchema(customers);
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const selectEmployeeSchema = createSelectSchema(employees);

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, orderDate: true });
export const selectOrderSchema = createSelectSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paymentDate: true });
export const selectPaymentSchema = createSelectSchema(payments);

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const selectSupplierSchema = createSelectSchema(suppliers);

export const insertRestockOrderSchema = createInsertSchema(restockOrders).omit({ id: true, orderDate: true });
export const selectRestockOrderSchema = createSelectSchema(restockOrders);
export const insertRestockItemSchema = createInsertSchema(restockItems);
export const selectRestockItemSchema = createSelectSchema(restockItems);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = z.infer<typeof selectRoleSchema>;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = z.infer<typeof selectProductCategorySchema>;

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = z.infer<typeof selectBranchSchema>;
export type InsertBranchInventory = z.infer<typeof insertBranchInventorySchema>;
export type BranchInventory = z.infer<typeof selectBranchInventorySchema>;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = z.infer<typeof selectCustomerSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = z.infer<typeof selectEmployeeSchema>;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = z.infer<typeof selectOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = z.infer<typeof selectOrderItemSchema>;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = z.infer<typeof selectSupplierSchema>;

export type InsertRestockOrder = z.infer<typeof insertRestockOrderSchema>;
export type RestockOrder = z.infer<typeof selectRestockOrderSchema>;
export type InsertRestockItem = z.infer<typeof insertRestockItemSchema>;
export type RestockItem = z.infer<typeof selectRestockItemSchema>;

// Auth types
export type AuthUser = {
  id: number;
  username: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
};

export type LoginCredentials = {
  username: string;
  password: string;
};
