CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
            workshop_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                        workshop_type VARCHAR(50) NOT NULL,
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

                                                            CREATE TABLE orders (
                                                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                                                    order_number VARCHAR(50) UNIQUE NOT NULL,
                                                                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                                                            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
                                                                                description TEXT NOT NULL,
                                                                                    status VARCHAR(50) DEFAULT 'PENDING',
                                                                                        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
                                                                                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                                                                    deleted_at TIMESTAMP WITH TIME ZONE
                                                                                                    );

                                                                                                    