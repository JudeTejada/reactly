// import { drizzle } from "drizzle-orm/neon-serverless";
// import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
// import { Pool } from "@neondatabase/serverless";
// import postgres from "postgres";
// import * as schema from './schema';

// export * from './schema';
// export * from './providers/drizzle.provider';

// // Create a database instance for direct import usage
// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error(
//     "DATABASE_URL is not defined. Please check your .env file."
//   );
// }

// // Detect if we're using NeonDB or local PostgreSQL
// const isNeon = connectionString.includes('neon.tech');

// export const db = isNeon
//   ? drizzle(new Pool({ connectionString }), { schema })
//   : drizzlePostgres(postgres(connectionString), { schema });
