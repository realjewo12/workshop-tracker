CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    workshop_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    workshop_type VARCHAR(50) NOT NULL,
    -- ADDED: Strict validation constraint to protect multi-tenant workshop data mapping
    CONSTRAINT check_workshop_type CHECK (workshop_type IN ('TAILOR', 'WELDER', 'CARPENTER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phone) 
);

-- ADDED: Explicit index on foreign key to optimize tenant customer lookup operations
CREATE INDEX idx_customers_user_id ON customers(user_id);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    -- ADDED: Strict validation constraint to enforce explicit, non-corrupted workflow states
    CONSTRAINT check_order_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED')),
    -- ADDED: Financial tracking columns to compute exact outstanding order balance criteria
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deposit_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ADDED: Optimization indexes to prevent slow sequential scans on foreign keys and dashboard metrics
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
