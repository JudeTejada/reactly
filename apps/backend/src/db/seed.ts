// import "dotenv/config";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema";
// import { users, projects, feedback } from "./schema";
// import { NewUser, NewProject, NewFeedback } from "./schema";

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   throw new Error(
//     "DATABASE_URL is not defined. Please check your .env file."
//   );
// }

// const client = postgres(connectionString);
// export const db = drizzle(client, { schema });

// const seedData = async () => {
//   console.log("🌱 Starting database seed...");

//   // Clear existing data
//   await db.delete(feedback);
//   await db.delete(projects);
//   await db.delete(users);
//   console.log("🧹 Cleared existing data");

//   // Create sample users
//   const sampleUsers: NewUser[] = [
//     {
//       clerkUserId: "user_123456789",
//       email: "john@example.com",
//       name: "John Doe",
//       plan: "pro"
//     },
//     {
//       clerkUserId: "user_987654321",
//       email: "sarah@example.com",
//       name: "Sarah Smith",
//       plan: "free"
//     },
//     {
//       clerkUserId: "user_456789123",
//       email: "mike@example.com",
//       name: "Mike Johnson",
//       plan: "pro"
//     }
//   ];

//   const insertedUsers = await db.insert(users).values(sampleUsers).returning();
//   console.log(`👥 Created ${insertedUsers.length} users`);

//   // Create sample projects
//   const sampleProjects: NewProject[] = [
//     {
//       name: "E-commerce Dashboard",
//       apiKey: "rk_test_ecommerce_dashboard_123",
//       userId: insertedUsers[0].id,
//       allowedDomains: ["https://mystore.com", "https://app.mystore.com"],
//       webhookUrl: "https://mystore.com/webhooks/feedback",
//       isActive: true

//     },
//     {
//       name: "Mobile App Beta",
//       apiKey: "rk_test_mobile_beta_456",
//       userId: insertedUsers[0].id,
//       allowedDomains: ["https://myapp.com"],
//       webhookUrl: null,
//       isActive: true
//     },
//     {
//       name: "SaaS Platform",
//       apiKey: "rk_test_saas_platform_789",
//       userId: insertedUsers[1].id,
//       allowedDomains: ["https://saas.example.com"],
//       webhookUrl: "https://saas.example.com/api/webhooks",
//       isActive: true
//     },
//     {
//       name: "Landing Page",
//       apiKey: "rk_test_landing_page_012",
//       userId: insertedUsers[2].id,
//       allowedDomains: ["https://landing.example.com"],
//       webhookUrl: null,
//       isActive: false
//     }
//   ];

//   const insertedProjects = await db.insert(projects).values(sampleProjects).returning();
//   console.log(`🚀 Created ${insertedProjects.length} projects`);

//   // Create sample feedback
//   const sampleFeedback: NewFeedback[] = [
//     // Feedback for E-commerce Dashboard
//     {
//       projectId: insertedProjects[0].id,
//       text: "The dashboard is really intuitive and helps me track sales effectively!",
//       rating: 5,
//       category: "ui",
//       sentiment: "positive",
//       sentimentScore: 0.8,
//       metadata: {
//         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//         page: "/dashboard",
//         sessionId: "sess_123456"
//       }
//     },
//     {
//       projectId: insertedProjects[0].id,
//       text: "Would love to see more detailed analytics for customer behavior.",
//       rating: 4,
//       category: "feature",
//       sentiment: "positive",
//       sentimentScore: 0.6,
//       metadata: {
//         userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
//         page: "/analytics",
//         sessionId: "sess_789012"
//       }
//     },
//     {
//       projectId: insertedProjects[0].id,
//       text: "The export feature is broken - it keeps timing out.",
//       rating: 2,
//       category: "bug",
//       sentiment: "negative",
//       sentimentScore: -0.7,
//       metadata: {
//         userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
//         page: "/reports",
//         sessionId: "sess_345678"
//       }
//     },
//     // Feedback for Mobile App Beta
//     {
//       projectId: insertedProjects[1].id,
//       text: "Great app! The new features are exactly what we needed.",
//       rating: 5,
//       category: "feature",
//       sentiment: "positive",
//       sentimentScore: 0.9,
//       metadata: {
//         userAgent: "Reactly-iOS/1.0.0",
//         page: "/home",
//         sessionId: "mobile_sess_001"
//       }
//     },
//     {
//       projectId: insertedProjects[1].id,
//       text: "App crashes when I try to upload large files.",
//       rating: 1,
//       category: "bug",
//       sentiment: "negative",
//       sentimentScore: -0.8,
//       metadata: {
//         userAgent: "Reactly-Android/1.0.0",
//         page: "/upload",
//         sessionId: "mobile_sess_002"
//       }
//     },
//     // Feedback for SaaS Platform
//     {
//       projectId: insertedProjects[2].id,
//       text: "The API documentation is comprehensive and easy to follow.",
//       rating: 4,
//       category: "documentation",
//       sentiment: "positive",
//       sentimentScore: 0.7,
//       metadata: {
//         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//         page: "/docs/api",
//         sessionId: "sess_901234"
//       }
//     },
//     {
//       projectId: insertedProjects[2].id,
//       text: "Pricing plans are confusing. Need clearer tier comparisons.",
//       rating: 3,
//       category: "pricing",
//       sentiment: "neutral",
//       sentimentScore: 0.1,
//       metadata: {
//         userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
//         page: "/pricing",
//         sessionId: "sess_567890"
//       }
//     },
//     // Feedback for Landing Page (inactive project)
//     {
//       projectId: insertedProjects[3].id,
//       text: "The landing page looks professional but loads slowly.",
//       rating: 3,
//       category: "performance",
//       sentiment: "neutral",
//       sentimentScore: -0.2,
//       metadata: {
//         userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//         page: "/",
//         sessionId: "sess_234567"
//       }
//     }
//   ];

//   const insertedFeedback = await db.insert(feedback).values(sampleFeedback).returning();
//   console.log(`💬 Created ${insertedFeedback.length} feedback entries`);

//   console.log("✅ Database seed completed successfully!");
//   console.log("\n📊 Summary:");
//   console.log(`   Users: ${insertedUsers.length}`);
//   console.log(`   Projects: ${insertedProjects.length}`);
//   console.log(`   Feedback: ${insertedFeedback.length}`);

//   console.log("\n🔑 Sample API Keys:");
//   insertedProjects.forEach(project => {
//     console.log(`   ${project.name}: ${project.apiKey}`);
//   });
// };

// // Run seed if this file is executed directly
// if (require.main === module) {
//   seedData()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error("❌ Seed failed:", error);
//       process.exit(1);
//     });
// }

// export { seedData };