CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE (Multi-Tenant Core)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    workshop_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    workshop_type VARCHAR(50) NOT NULL,
    CONSTRAINT check_workshop_type CHECK (workshop_type IN ('TAILOR', 'WELDER', 'CARPENTER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. CUSTOMERS TABLE
-- ==========================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phone) 
);

-- Index foreign key to optimize tenant customer list lookups
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- ==========================================
-- 3. ORDERS TABLE
-- ==========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Format enforced via server-side logic: ORD-YYYYMMDD-XXXX
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT check_order_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED')),
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deposit_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- PERFORMANCE INDEXES FOR ORDERS:
-- Note: 'idx_orders_user_id' and 'idx_orders_due_date' are intentionally omitted 
-- because they are completely covered by the high-performance composite cursor index below.
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- High-Performance Composite Index for tenant-isolated cursor-based pagination (sorted by due_date)
CREATE INDEX idx_orders_tenant_cursor ON orders (user_id, due_date, id);

-- ==========================================
-- 4. SECURITY & AUDIT LOGS
-- ==========================================
CREATE TABLE order_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    action_reason TEXT NOT NULL, -- Explains why an order was modified or explicitly reopened
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index the audit log table to quickly fetch history for any specific order detail panel
CREATE INDEX idx_order_audit_logs_lookup ON order_audit_logs(order_id);
