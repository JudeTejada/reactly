-- Initialize Reactly development database
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional schemas if needed (they will be created by Drizzle anyway)
-- CREATE SCHEMA IF NOT EXISTS app;

-- Grant necessary permissions (already granted to postgres user)
-- GRANT ALL PRIVILEGES ON DATABASE reactly_dev TO postgres;

-- You can add any initial setup queries here
-- For example, setting up extensions that your application might use
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";

COMMENT ON DATABASE reactly_dev IS 'Reactly development database';