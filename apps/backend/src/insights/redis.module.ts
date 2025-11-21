import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { BullModule } from "@nestjs/bullmq";
import { redisStore } from "cache-manager-redis-yet";
import { InsightsQueueService } from "./insights-queue.service";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get("REDIS_HOST", "localhost");
        const redisPort = configService.get("REDIS_PORT", 6379);
        const redisPassword = configService.get("REDIS_PASSWORD");

        return {
          store: await redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
              ...(redisPassword && { password: redisPassword }),
            },
            ttl: 24 * 60 * 60 * 1000, // 24 hours
          }),
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get("REDIS_HOST");
        const redisPort = configService.get("REDIS_PORT", 6379);

        // Only configure BullMQ if Redis is available
        if (redisHost) {
          return {
            connection: {
              host: redisHost,
              port: redisPort,
              password: configService.get("REDIS_PASSWORD") || undefined,
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
  providers: [InsightsQueueService],
  exports: [CacheModule, BullModule, InsightsQueueService],
})
export class RedisModule {}
