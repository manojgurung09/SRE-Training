# Frontend Architecture

React frontend architecture, component structure, and state management.

## Overview

**Framework:** React 18.3

**Build Tool:** Vite 5.4

**Language:** TypeScript 5.5

**Styling:** Tailwind CSS 3.4

**Icons:** Lucide React

**Entry Point:** `src/main.tsx`

**Main Component:** `src/App.tsx`

**Source:** Frontend dependencies in `package.json` lines 49-50, 74.

## Application Structure

### Entry Point

**File:** `src/main.tsx`

**Setup:**
- React StrictMode
- AuthProvider context
- CartProvider context
- App component rendering

**Source:** Entry point in `src/main.tsx`.

### Main Application

**File:** `src/App.tsx`

**Features:**
- Navigation bar
- View routing
- Authentication UI
- Shopping cart UI
- Admin panel access

**Source:** Main application in `src/App.tsx`.

## Component Structure

### Main Views

**Views:**
- `products` - Product catalog
- `orders` - Order management
- `checkout` - Checkout process
- `tracking` - Order tracking
- `admin` - Admin panel
- `profile` - User profile

**Source:** View types in `src/App.tsx` line 14.

### Components

**Location:** `src/components/`

**Components:**
- `ProductCatalog` - Product listing
- `OrderManagement` - Order management
- `AuthModal` - Authentication modal
- `ShoppingCart` - Shopping cart sidebar
- `Checkout` - Checkout form
- `OrderTracking` - Order tracking view
- `AdminPanel` - Admin dashboard
- `UserProfile` - User profile management

**Source:** Component imports in `src/App.tsx` lines 3-10.

## State Management

### Context Providers

**AuthContext:**
- User authentication state
- User profile data
- Admin role check
- Sign in/out functions

**Source:** AuthContext usage in `src/App.tsx` line 33.

**CartContext:**
- Shopping cart items
- Cart operations (add, remove, update)
- Total items count

**Source:** CartContext usage in `src/App.tsx` line 34.

### Local State

**View State:**
- Current view (`currentView`)
- Mobile menu state (`mobileMenuOpen`)
- Auth modal state (`authModalOpen`)
- Cart sidebar state (`cartOpen`)
- Completed order ID (`completedOrderId`)

**Source:** Local state in `src/App.tsx` lines 28-32.

## Navigation

### Navigation Items

**Items:**
- Products (Package icon)
- My Orders (Truck icon)

**Source:** Navigation items in `src/App.tsx` lines 22-25.

### User Actions

**Actions:**
- Shopping cart (ShoppingBag icon)
- User profile (User icon)
- Admin panel (Shield icon, admin only)
- Sign in/out (LogIn/LogOut icons)

**Source:** User actions in `src/App.tsx` lines 108-175.

## Authentication

### Supabase Auth

**Client:** Supabase JavaScript client

**Configuration:**
- `VITE_SUPABASE_URL` - Project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key

**Source:** Supabase client in `src/lib/supabase.ts`.

### Auth Context

**File:** `src/contexts/AuthContext.tsx`

**Functions:**
- Sign up
- Sign in
- Sign out
- User profile management
- Admin role check

**Source:** AuthContext in `src/contexts/AuthContext.tsx`.

## Styling

### Tailwind CSS

**Configuration:** Tailwind CSS 3.4

**Usage:**
- Utility classes
- Responsive design
- Custom gradients
- Color schemes

**Source:** Tailwind usage throughout `src/App.tsx`.

### Design System

**Colors:**
- Orange/Red gradient (primary)
- Gray (neutral)
- Green (success)
- Purple (admin)

**Source:** Color usage in `src/App.tsx` lines 99, 133, 147, 169.

## API Integration

### API Gateway

**Base URL:** `http://localhost:3000` (configurable)

**Endpoints:**
- `/api/products` - Products
- `/api/orders` - Orders
- `/api/payments` - Payments

**Source:** API integration in components.

## Responsive Design

### Mobile Support

**Features:**
- Mobile menu toggle
- Responsive navigation
- Mobile-optimized views

**Source:** Mobile menu in `src/App.tsx` lines 81-90, 179-201.

### Desktop Support

**Features:**
- Full navigation bar
- Sidebar components
- Multi-column layouts

**Source:** Desktop layout in `src/App.tsx` lines 92-176.

## Training vs Production

### Training Mode

**Features:**
- Full UI for learning
- All components accessible
- Detailed error messages

**Use Case:** SRE training, development

### Production Mode

**Features:**
- Optimized builds
- Production error handling
- Performance optimizations

**Use Case:** Production deployment

**Source:** Mode differences based on build configuration.

## Next Steps

- [System Architecture](01-system-architecture.md) - Overall system architecture
- [Backend Architecture](02-backend-architecture.md) - Express.js backend
- [Database Architecture](04-database-architecture.md) - Database layer
- [API Reference](../03-api-reference/) - API documentation

