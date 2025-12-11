import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { BullModule } from "@nestjs/bullmq";
import { redisStore } from "cache-manager-redis-yet";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get(
          "UPSTASH_REDIS_HOST",
          "localhost"
        );
        const redisPort = configService.get("UPSTASH_REDIS_PORT", 6379);
        const redisPassword = configService.get("UPSTASH_REDIS_PASSWORD");
        // Enable TLS for Upstash (detects upstash.io in hostname)
        const isUpstash = redisHost.includes("upstash.io");

        return {
          store: await redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
              // Enable TLS for Upstash connections (node-redis uses tls: true)
              ...(isUpstash && { tls: true }),
            },
            password: redisPassword || undefined,
            ttl: 24 * 60 * 60 * 1000, // 24 hours
          }),
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get("UPSTASH_REDIS_HOST");
        const redisPort = configService.get("UPSTASH_REDIS_PORT", 6379);
        const redisPassword = configService.get("UPSTASH_REDIS_PASSWORD");
        // Enable TLS for Upstash (detects upstash.io in hostname)
        const isUpstash = redisHost?.includes("upstash.io");

        // Only configure BullMQ if Redis is available
        if (redisHost) {
          return {
            connection: {
              host: redisHost,
              port: redisPort,
              password: redisPassword || undefined,
              // BullMQ requires maxRetriesPerRequest to be null
              maxRetriesPerRequest: null,
              // Enable TLS for Upstash connections (ioredis uses tls: {})
              ...(isUpstash && { tls: {} }),
            },
          };
        }

        // Return default configuration if Redis not configured
        return {
          connection: {
            host: "localhost",
            port: 6379,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: "insights-generate",
    }),
  ],
  providers: [],
  exports: [CacheModule, BullModule],
})
export class RedisModule {}


