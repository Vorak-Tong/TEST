import {
  users,
  roles,
  products,
  productCategories,
  branches,
  branchInventory,
  customers,
  employees,
  orders,
  orderItems,
  payments,
  suppliers,
  restockOrders,
  restockItems,
  type User,
  type Role,
  type Product,
  type ProductCategory,
  type Branch,
  type BranchInventory,
  type Customer,
  type Employee,
  type Order,
  type OrderItem,
  type Payment,
  type Supplier,
  type RestockOrder,
  type RestockItem,
  type InsertUser,
  type InsertRole,
  type InsertProduct,
  type InsertProductCategory,
  type InsertBranch,
  type InsertBranchInventory,
  type InsertCustomer,
  type InsertEmployee,
  type InsertOrder,
  type InsertOrderItem,
  type InsertPayment,
  type InsertSupplier,
  type InsertRestockOrder,
  type InsertRestockItem,
  type AuthUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserWithRole(id: number): Promise<AuthUser | undefined>;
  getUserWithRoleByUsername(username: string): Promise<AuthUser | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getAllUsersWithRoles(): Promise<AuthUser[]>;

  // Role management
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;

  // Product management
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Category management
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  getAllProductCategories(): Promise<ProductCategory[]>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;

  // Branch management
  getBranch(id: number): Promise<Branch | undefined>;
  getAllBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, branch: Partial<InsertBranch>): Promise<Branch | undefined>;
  deleteBranch(id: number): Promise<boolean>;

  // Inventory management
  getBranchInventory(branchId: number, productId: number): Promise<BranchInventory | undefined>;
  getBranchInventoryByBranch(branchId: number): Promise<BranchInventory[]>;
  getAllBranchInventory(): Promise<BranchInventory[]>;
  updateBranchInventory(branchId: number, productId: number, quantity: number): Promise<BranchInventory | undefined>;

  // Customer management
  getCustomer(id: number): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Employee management
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  // Order management
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByBranch(branchId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Payment management
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByOrder(orderId: number): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Supplier management
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Restock management
  getRestockOrder(id: number): Promise<RestockOrder | undefined>;
  getAllRestockOrders(): Promise<RestockOrder[]>;
  createRestockOrder(order: InsertRestockOrder): Promise<RestockOrder>;
  getRestockItems(restockOrderId: number): Promise<RestockItem[]>;
  createRestockItem(item: InsertRestockItem): Promise<RestockItem>;

  // Analytics
  getSalesStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: Array<{ productId: number; productName: string; totalSold: number; revenue: number }>;
  }>;

  getBranchStats(): Promise<Array<{ branchId: number; branchName: string; totalSales: number; totalOrders: number }>>;

  getInventoryStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalInventoryValue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserWithRole(id: number): Promise<AuthUser | undefined> {
    const [result] = await db.select({
      id: users.id,
      username: users.username,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
      },
    }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, id));
    return result || undefined;
  }

  async getUserWithRoleByUsername(username: string): Promise<AuthUser | undefined> {
    const [result] = await db.select({
      id: users.id,
      username: users.username,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
      },
    }).from(users).innerJoin(roles, eq(users.roleId, roles.id)).where(eq(users.username, username));
    return result || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowsAffected > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsersWithRoles(): Promise<AuthUser[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      role: {
        id: roles.id,
        name: roles.name,
        description: roles.description,
      },
    }).from(users).innerJoin(roles, eq(users.roleId, roles.id));
  }

  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role || undefined;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role || undefined;
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    return role;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowsAffected > 0;
  }

  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category || undefined;
  }

  async getAllProductCategories(): Promise<ProductCategory[]> {
    return await db.select().from(productCategories);
  }

  async createProductCategory(insertCategory: InsertProductCategory): Promise<ProductCategory> {
    const [category] = await db.insert(productCategories).values(insertCategory).returning();
    return category;
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch || undefined;
  }

  async getAllBranches(): Promise<Branch[]> {
    return await db.select().from(branches);
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(insertBranch).returning();
    return branch;
  }

  async updateBranch(id: number, updateData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const [branch] = await db.update(branches).set(updateData).where(eq(branches.id, id)).returning();
    return branch || undefined;
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await db.delete(branches).where(eq(branches.id, id));
    return result.rowsAffected > 0;
  }

  async getBranchInventory(branchId: number, productId: number): Promise<BranchInventory | undefined> {
    const [inventory] = await db.select().from(branchInventory)
      .where(eq(branchInventory.branchId, branchId) && eq(branchInventory.productId, productId));
    return inventory || undefined;
  }

  async getBranchInventoryByBranch(branchId: number): Promise<BranchInventory[]> {
    return await db.select().from(branchInventory).where(eq(branchInventory.branchId, branchId));
  }

  async getAllBranchInventory(): Promise<BranchInventory[]> {
    return await db.select().from(branchInventory);
  }

  async updateBranchInventory(branchId: number, productId: number, quantity: number): Promise<BranchInventory | undefined> {
    const [inventory] = await db.insert(branchInventory)
      .values({ branchId, productId, quantity })
      .onDuplicateKeyUpdate({ quantity })
      .returning();
    return inventory || undefined;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrdersByBranch(branchId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.branchId, branchId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentByOrder(orderId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return payment || undefined;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(insertSupplier).returning();
    return supplier;
  }

  async getRestockOrder(id: number): Promise<RestockOrder | undefined> {
    const [order] = await db.select().from(restockOrders).where(eq(restockOrders.id, id));
    return order || undefined;
  }

  async getAllRestockOrders(): Promise<RestockOrder[]> {
    return await db.select().from(restockOrders);
  }

  async createRestockOrder(insertOrder: InsertRestockOrder): Promise<RestockOrder> {
    const [order] = await db.insert(restockOrders).values(insertOrder).returning();
    return order;
  }

  async getRestockItems(restockOrderId: number): Promise<RestockItem[]> {
    return await db.select().from(restockItems).where(eq(restockItems.restockOrderId, restockOrderId));
  }

  async createRestockItem(insertItem: InsertRestockItem): Promise<RestockItem> {
    const [item] = await db.insert(restockItems).values(insertItem).returning();
    return item;
  }

  async getSalesStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: Array<{ productId: number; productName: string; totalSold: number; revenue: number }>;
  }> {
    const [salesResult] = await db.select({
      totalSales: sql<number>`SUM(oi.unit_price * oi.quantity)`,
      totalOrders: sql<number>`COUNT(DISTINCT o.order_id)`,
    }).from(orders).as('o')
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId)).as('oi');

    const topProducts = await db.select({
      productId: products.id,
      productName: products.name,
      totalSold: sql<number>`SUM(oi.quantity)`,
      revenue: sql<number>`SUM(oi.unit_price * oi.quantity)`,
    }).from(orderItems).as('oi')
      .innerJoin(products, eq(orderItems.productId, products.id))
      .groupBy(products.id, products.name)
      .orderBy(sql`SUM(oi.quantity) DESC`)
      .limit(5);

    return {
      totalSales: salesResult?.totalSales || 0,
      totalOrders: salesResult?.totalOrders || 0,
      averageOrderValue: salesResult?.totalOrders ? salesResult.totalSales / salesResult.totalOrders : 0,
      topSellingProducts: topProducts,
    };
  }

  async getBranchStats(): Promise<Array<{ branchId: number; branchName: string; totalSales: number; totalOrders: number }>> {
    return await db.select({
      branchId: branches.id,
      branchName: branches.name,
      totalSales: sql<number>`SUM(oi.unit_price * oi.quantity)`,
      totalOrders: sql<number>`COUNT(DISTINCT o.order_id)`,
    }).from(branches)
      .leftJoin(orders, eq(branches.id, orders.branchId)).as('o')
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId)).as('oi')
      .groupBy(branches.id, branches.name);
  }

  async getInventoryStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalInventoryValue: number;
  }> {
    const [productCount] = await db.select({
      totalProducts: sql<number>`COUNT(*)`,
    }).from(products);

    const [stockStats] = await db.select({
      lowStockItems: sql<number>`COUNT(CASE WHEN bi.quantity < 10 AND bi.quantity > 0 THEN 1 END)`,
      outOfStockItems: sql<number>`COUNT(CASE WHEN bi.quantity = 0 THEN 1 END)`,
      totalInventoryValue: sql<number>`SUM(p.price * bi.quantity)`,
    }).from(branchInventory).as('bi')
      .innerJoin(products, eq(branchInventory.productId, products.id)).as('p');

    return {
      totalProducts: productCount?.totalProducts || 0,
      lowStockItems: stockStats?.lowStockItems || 0,
      outOfStockItems: stockStats?.outOfStockItems || 0,
      totalInventoryValue: stockStats?.totalInventoryValue || 0,
    };
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private roles: Map<number, Role> = new Map();
  private products: Map<number, Product> = new Map();
  private productCategories: Map<number, ProductCategory> = new Map();
  private branches: Map<number, Branch> = new Map();
  private branchInventory: Map<string, BranchInventory> = new Map();
  private customers: Map<number, Customer> = new Map();
  private employees: Map<number, Employee> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private payments: Map<number, Payment> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private restockOrders: Map<number, RestockOrder> = new Map();
  private restockItems: Map<string, RestockItem> = new Map();

  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed roles
    const adminRole: Role = { id: 1, name: "Administrator", description: "Has full access to all system modules and configurations" };
    const backendRole: Role = { id: 2, name: "Backend Developer", description: "Can access APIs and backend components for development" };
    const analystRole: Role = { id: 3, name: "Business Analyst", description: "Can view reports, data, and system performance, but cannot modify data" };
    
    this.roles.set(1, adminRole);
    this.roles.set(2, backendRole);
    this.roles.set(3, analystRole);

    // Seed users with hashed passwords (in real app, these would be properly hashed)
    this.users.set(1, { id: 1, username: "admin", passwordHash: "hashed_password_admin", roleId: 1 });
    this.users.set(2, { id: 2, username: "backend_dev", passwordHash: "hashed_password_backend", roleId: 2 });
    this.users.set(3, { id: 3, username: "biz_analyst", passwordHash: "hashed_password_ba", roleId: 3 });

    // Seed product categories
    this.productCategories.set(1, { id: 1, name: "Beverages" });
    this.productCategories.set(2, { id: 2, name: "Snacks" });
    this.productCategories.set(3, { id: 3, name: "Dairy" });
    this.productCategories.set(4, { id: 4, name: "Produce" });

    // Seed products
    this.products.set(1, { id: 1, name: "Coca-Cola Can", price: "0.80", categoryId: 1, brand: "Coca-Cola" });
    this.products.set(2, { id: 2, name: "Lays Classic Chips", price: "1.20", categoryId: 2, brand: "Lays" });
    this.products.set(3, { id: 3, name: "Milk 1L", price: "1.50", categoryId: 3, brand: "Anchor" });
    this.products.set(4, { id: 4, name: "Banana (per kg)", price: "0.70", categoryId: 4, brand: "Local Farm" });

    // Seed branches
    this.branches.set(1, { id: 1, name: "Central Market Branch", location: "123 Market Street", phone: "0123456789" });
    this.branches.set(2, { id: 2, name: "Riverside Branch", location: "456 Riverside Blvd", phone: "0987654321" });

    // Seed inventory
    this.branchInventory.set("1-1", { branchId: 1, productId: 1, quantity: 100 });
    this.branchInventory.set("1-2", { branchId: 1, productId: 2, quantity: 50 });
    this.branchInventory.set("2-3", { branchId: 2, productId: 3, quantity: 5 });
    this.branchInventory.set("2-4", { branchId: 2, productId: 4, quantity: 30 });

    // Seed customers
    this.customers.set(1, { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", phone: "011223344", address: "21 Sunset Road" });
    this.customers.set(2, { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "022334455", address: "12 River Lane" });

    // Seed employees
    this.employees.set(1, { id: 1, firstName: "Alice", lastName: "Tan", email: "alice@supermarket.com", phone: "099887766", position: "Cashier", branchId: 1 });
    this.employees.set(2, { id: 2, firstName: "Bob", lastName: "Lee", email: "bob@supermarket.com", phone: "088776655", position: "Manager", branchId: 2 });

    // Seed orders
    this.orders.set(1, { id: 1, customerId: 1, branchId: 1, orderDate: new Date() });
    this.orders.set(2, { id: 2, customerId: 2, branchId: 2, orderDate: new Date() });

    // Seed order items
    this.orderItems.set("1-1", { orderId: 1, productId: 1, quantity: 2, unitPrice: "0.80" });
    this.orderItems.set("1-2", { orderId: 1, productId: 2, quantity: 1, unitPrice: "1.20" });
    this.orderItems.set("2-3", { orderId: 2, productId: 3, quantity: 1, unitPrice: "1.50" });
    this.orderItems.set("2-4", { orderId: 2, productId: 4, quantity: 3, unitPrice: "0.70" });

    // Seed payments
    this.payments.set(1, { id: 1, orderId: 1, paymentMethod: "Credit Card", paymentDate: new Date() });
    this.payments.set(2, { id: 2, orderId: 2, paymentMethod: "Cash", paymentDate: new Date() });

    this.currentId = 10;
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserWithRole(id: number): Promise<AuthUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const role = this.roles.get(user.roleId);
    if (!role) return undefined;

    return {
      id: user.id,
      username: user.username,
      role: {
        id: role.id,
        name: role.name,
        description: role.description
      }
    };
  }

  async getUserWithRoleByUsername(username: string): Promise<AuthUser | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    return this.getUserWithRole(user.id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllUsersWithRoles(): Promise<AuthUser[]> {
    const users = await this.getAllUsers();
    const authUsers: AuthUser[] = [];
    
    for (const user of users) {
      const authUser = await this.getUserWithRole(user.id);
      if (authUser) {
        authUsers.push(authUser);
      }
    }
    
    return authUsers;
  }

  // Role management
  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return Array.from(this.roles.values()).find(role => role.name === name);
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = this.currentId++;
    const role: Role = { ...insertRole, id, description: insertRole.description || null };
    this.roles.set(id, role);
    return role;
  }

  // Product management
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentId++;
    const product: Product = { ...insertProduct, id, brand: insertProduct.brand || null };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category management
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    return this.productCategories.get(id);
  }

  async getAllProductCategories(): Promise<ProductCategory[]> {
    return Array.from(this.productCategories.values());
  }

  async createProductCategory(insertCategory: InsertProductCategory): Promise<ProductCategory> {
    const id = this.currentId++;
    const category: ProductCategory = { ...insertCategory, id };
    this.productCategories.set(id, category);
    return category;
  }

  // Branch management
  async getBranch(id: number): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async getAllBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const id = this.currentId++;
    const branch: Branch = { ...insertBranch, id };
    this.branches.set(id, branch);
    return branch;
  }

  async updateBranch(id: number, updateData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const branch = this.branches.get(id);
    if (!branch) return undefined;
    
    const updatedBranch = { ...branch, ...updateData };
    this.branches.set(id, updatedBranch);
    return updatedBranch;
  }

  async deleteBranch(id: number): Promise<boolean> {
    return this.branches.delete(id);
  }

  // Inventory management
  async getBranchInventory(branchId: number, productId: number): Promise<BranchInventory | undefined> {
    return this.branchInventory.get(`${branchId}-${productId}`);
  }

  async getBranchInventoryByBranch(branchId: number): Promise<BranchInventory[]> {
    return Array.from(this.branchInventory.values()).filter(item => item.branchId === branchId);
  }

  async getAllBranchInventory(): Promise<BranchInventory[]> {
    return Array.from(this.branchInventory.values());
  }

  async updateBranchInventory(branchId: number, productId: number, quantity: number): Promise<BranchInventory | undefined> {
    const key = `${branchId}-${productId}`;
    const item = this.branchInventory.get(key);
    if (!item) return undefined;
    
    const updatedItem = { ...item, quantity };
    this.branchInventory.set(key, updatedItem);
    return updatedItem;
  }

  // Customer management
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  // Employee management
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentId++;
    const employee: Employee = { ...insertEmployee, id, branchId: insertEmployee.branchId || null };
    this.employees.set(id, employee);
    return employee;
  }

  // Order management
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByBranch(branchId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.branchId === branchId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const order: Order = { ...insertOrder, id, orderDate: new Date(), customerId: insertOrder.customerId || null };
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const key = `${insertOrderItem.orderId}-${insertOrderItem.productId}`;
    const orderItem: OrderItem = { ...insertOrderItem };
    this.orderItems.set(key, orderItem);
    return orderItem;
  }

  // Payment management
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByOrder(orderId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => payment.orderId === orderId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentId++;
    const payment: Payment = { ...insertPayment, id, paymentDate: new Date() };
    this.payments.set(id, payment);
    return payment;
  }

  // Supplier management
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentId++;
    const supplier: Supplier = { ...insertSupplier, id };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  // Restock management
  async getRestockOrder(id: number): Promise<RestockOrder | undefined> {
    return this.restockOrders.get(id);
  }

  async getAllRestockOrders(): Promise<RestockOrder[]> {
    return Array.from(this.restockOrders.values());
  }

  async createRestockOrder(insertOrder: InsertRestockOrder): Promise<RestockOrder> {
    const id = this.currentId++;
    const order: RestockOrder = { 
      ...insertOrder, 
      id, 
      orderDate: new Date(), 
      supplierId: insertOrder.supplierId || null,
      status: insertOrder.status || null
    };
    this.restockOrders.set(id, order);
    return order;
  }

  async getRestockItems(restockOrderId: number): Promise<RestockItem[]> {
    return Array.from(this.restockItems.values()).filter(item => item.restockOrderId === restockOrderId);
  }

  async createRestockItem(insertItem: InsertRestockItem): Promise<RestockItem> {
    const key = `${insertItem.restockOrderId}-${insertItem.productId}`;
    const item: RestockItem = { ...insertItem };
    this.restockItems.set(key, item);
    return item;
  }

  // Analytics
  async getSalesStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: Array<{ productId: number; productName: string; totalSold: number; revenue: number }>;
  }> {
    const orders = await this.getAllOrders();
    const totalOrders = orders.length;
    
    let totalSales = 0;
    const productSales: Map<number, { totalSold: number; revenue: number }> = new Map();
    
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      for (const item of items) {
        const itemTotal = parseFloat(item.unitPrice) * item.quantity;
        totalSales += itemTotal;
        
        const existing = productSales.get(item.productId) || { totalSold: 0, revenue: 0 };
        productSales.set(item.productId, {
          totalSold: existing.totalSold + item.quantity,
          revenue: existing.revenue + itemTotal
        });
      }
    }
    
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    const topSellingProducts = Array.from(productSales.entries())
      .map(([productId, stats]) => {
        const product = this.products.get(productId);
        return {
          productId,
          productName: product?.name || 'Unknown',
          totalSold: stats.totalSold,
          revenue: stats.revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topSellingProducts
    };
  }

  async getBranchStats(): Promise<Array<{ branchId: number; branchName: string; totalSales: number; totalOrders: number }>> {
    const branches = await this.getAllBranches();
    const stats: Array<{ branchId: number; branchName: string; totalSales: number; totalOrders: number }> = [];
    
    for (const branch of branches) {
      const orders = await this.getOrdersByBranch(branch.id);
      let totalSales = 0;
      
      for (const order of orders) {
        const items = await this.getOrderItems(order.id);
        for (const item of items) {
          totalSales += parseFloat(item.unitPrice) * item.quantity;
        }
      }
      
      stats.push({
        branchId: branch.id,
        branchName: branch.name,
        totalSales,
        totalOrders: orders.length
      });
    }
    
    return stats;
  }

  async getInventoryStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalInventoryValue: number;
  }> {
    const inventory = await this.getAllBranchInventory();
    const products = await this.getAllProducts();
    
    let totalProducts = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let totalInventoryValue = 0;
    
    const productMap = new Map(products.map(p => [p.id, p]));
    
    for (const item of inventory) {
      const product = productMap.get(item.productId);
      if (product) {
        totalProducts++;
        totalInventoryValue += parseFloat(product.price) * item.quantity;
        
        if (item.quantity === 0) {
          outOfStockItems++;
        } else if (item.quantity < 10) {
          lowStockItems++;
        }
      }
    }
    
    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue
    };
  }
}

export const storage = new MemStorage();
