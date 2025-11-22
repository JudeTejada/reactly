# Database Setup Guide

## ✅ Migration Generated Successfully!

Your database migration has been created: `drizzle/0000_melted_callisto.sql`

This migration will create:

- ✅ **users** table (7 columns)
- ✅ **projects** table (9 columns)
- ✅ **feedback** table (10 columns)
- ✅ Foreign key relationships with cascade delete
- ✅ Unique constraints on `api_key` and `clerk_user_id`

## 🚀 Next Steps

### Option 1: Run Migration (Recommended)

This applies the migration file to your database:

```bash
# Make sure you have DATABASE_URL in .env
pnpm db:migrate
```

This will:

1. Read the migration SQL file
2. Execute it against your NeonDB database
3. Create all tables and relationships

### Option 2: Push Schema (Development Only)

This pushes the schema directly without migration files:

```bash
pnpm db:push
```

⚠️ Use this only in development. For production, always use migrations.

## 📊 Database Schema Overview

### Users Table

```sql
- id (UUID, primary key)
- clerk_user_id (unique, from Clerk)
- email
- name (optional)
- plan (free/pro/enterprise)
- created_at, updated_at
```

### Projects Table

```sql
- id (UUID, primary key)
- name
- api_key (unique, auto-generated)
- user_id (FK to users)
- allowed_domains (JSON array)
- webhook_url (optional, for Discord)
- is_active (boolean)
- created_at, updated_at
```

### Feedback Table

```sql
- id (UUID, primary key)
- project_id (FK to projects)
- text
- rating (1-5)
- category (bug/feature/etc.)
- sentiment (positive/negative/neutral)
- sentiment_score (0-1)
- metadata (JSON)
- created_at, updated_at
```

## 🔐 Before Running Migration

### 1. Get NeonDB Connection String

1. Go to https://neon.tech
2. Sign up or sign in (free tier available)
3. Create a new project
4. Copy the connection string
5. It looks like: `postgresql://user:password@host.neon.tech/database?sslmode=require`

### 2. Set Environment Variable

Add to `apps/backend/.env`:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

### 3. Test Connection

```bash
# This will open Drizzle Studio if connection works
pnpm db:studio
```

## ✅ Running the Migration

```bash
cd apps/backend

# Run migration
pnpm db:migrate
```

You should see:

```
Running migrations...
Migrations completed!
```

## 🎯 Verify Migration

### Option 1: Use Drizzle Studio

```bash
pnpm db:studio
```

Opens a GUI at http://localhost:4983 where you can:

- Browse tables
- View schema
- Run queries
- Insert test data

### Option 2: Check in NeonDB Dashboard

1. Go to https://console.neon.tech
2. Select your project
3. Go to "Tables" tab
4. You should see: `users`, `projects`, `feedback`

## 🔄 Schema Changes Workflow

When you modify the database schema:

```bash
# 1. Edit src/db/schema.ts
# ... make your changes ...

# 2. Generate new migration
pnpm db:generate

# 3. Review migration file in drizzle/ folder

# 4. Run migration
pnpm db:migrate
```

## 📝 Available Commands

```bash
pnpm db:generate   # Generate migration from schema
pnpm db:migrate    # Run pending migrations
pnpm db:push       # Push schema directly (dev only)
pnpm db:studio     # Open Drizzle Studio GUI
```

## 🐛 Troubleshooting

### "Connection terminated unexpectedly"

- Check DATABASE_URL is correct
- Ensure NeonDB project is active
- Verify SSL mode is included: `?sslmode=require`

### "relation already exists"

Tables already exist. Either:

1. Drop tables and re-run migration
2. Or skip to next step if tables are correct

### "No DATABASE_URL found"

Add DATABASE_URL to `apps/backend/.env`

## 🎉 Once Migration is Complete

Your database is ready! You can now:

1. ✅ Start the backend server
2. ✅ Create users (auto-synced from Clerk)
3. ✅ Create projects with API keys
4. ✅ Submit feedback via the widget
5. ✅ View analytics in the dashboard

## 🔗 Next Steps

After migration:

```bash
# Start the backend
pnpm dev

# Server starts at http://localhost:3001
# Test with: curl http://localhost:3001/health
```

The backend will:

- ✅ Connect to your database
- ✅ Accept API requests
- ✅ Store feedback with AI sentiment analysis
- ✅ Serve data to the dashboard
