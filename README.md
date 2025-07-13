# Replit.md - G1 Supermarket Management System

## Overview

The G1 Supermarket Management System is a complete, production-ready full-stack web application for managing supermarket operations. Successfully deployed with comprehensive role-based access control, it enables administrators, backend developers, and business analysts to manage users, view sales data, handle inventory, and monitor all aspects of supermarket business operations. The system has been tested and confirmed working by the user.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### January 13, 2025
- Successfully deployed complete supermarket management system
- User confirmed satisfaction with application functionality and UI
- All core features working: authentication, role-based access, CRUD operations
- System tested with all three user roles (Administrator, Backend Developer, Business Analyst)
- Fixed TypeScript type safety issues in storage layer
- Updated database schema to MySQL (from PostgreSQL)
- Added MySQL database configuration with mysql2 driver
- Created DatabaseStorage class for MySQL integration (available for production use)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: MySQL with Drizzle ORM (configured with mysql2 driver)
- **Storage**: In-memory storage for development (DatabaseStorage class available for production)
- **Authentication**: Session-based authentication with role-based access control
- **API**: REST API with JSON responses

### Build System
- **Development**: TSX for TypeScript execution
- **Production**: ESBuild for server bundling, Vite for client bundling
- **Type Checking**: TypeScript compiler with strict mode enabled

## Key Components

### Authentication System
- Role-based access control with three roles: Administrator, Backend Developer, Business Analyst
- Session management with localStorage persistence
- Protected routes with role-specific access restrictions
- Simple password-based authentication (demo implementation)

### User Management
- User creation and management (Admin only)
- Role assignment and modification
- User deletion capabilities
- Real-time user status tracking

### Sales Analytics
- Sales data visualization with charts (Recharts library)
- Revenue tracking and trend analysis
- Branch performance comparison
- Category-wise sales breakdown

### Inventory Management
- Product inventory tracking across branches
- Stock level monitoring with low stock alerts
- Inventory updates and adjustments
- Multi-branch inventory management

### Product Management
- Product catalog management
- Category organization
- Price management
- Brand tracking

### Branch Management
- Multiple branch support
- Branch-specific inventory tracking
- Location and contact information management
- Branch performance analytics

## Data Flow

### Database Schema
The application uses a MySQL database with the following main entities:
- **Users & Roles**: User authentication and authorization
- **Products & Categories**: Product catalog management
- **Branches**: Multi-location support
- **Inventory**: Stock tracking per branch
- **Orders & Payments**: Transaction management
- **Customers & Employees**: Personnel management

### API Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/products/*` - Product management
- `/api/branches/*` - Branch management
- `/api/inventory/*` - Inventory operations
- `/api/orders/*` - Order management
- `/api/analytics/*` - Business analytics

### State Management
- TanStack Query for server state caching and synchronization
- React Context for authentication state
- Local component state for UI interactions

## External Dependencies

### Core Dependencies
- **mysql2**: MySQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **express**: Web server framework
- **react**: UI framework
- **typescript**: Type safety

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Chart library for data visualization

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Environment
- Vite development server for frontend
- TSX for backend TypeScript execution
- Hot module replacement for fast development
- Environment-based configuration

### Production Build
- Vite builds the client application to `dist/public`
- ESBuild bundles the server application to `dist/index.js`
- Static file serving for production deployment
- Database migrations via Drizzle Kit

### Database Management
- Drizzle Kit for schema migrations
- MySQL dialect configuration
- Connection via MySQL environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)
- Shared schema definitions between client and server
- In-memory storage for development, DatabaseStorage class for production MySQL integration

### Environment Configuration
- Separate development and production configurations
- Environment variable management
- Database connection handling
- CORS and security configurations

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and role-based access control for secure multi-user operation.