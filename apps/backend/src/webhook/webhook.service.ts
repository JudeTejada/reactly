import { Injectable, Logger, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { Feedback } from "../db/schema";
import { users } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  async handleUserCreated(data: any): Promise<void> {
    try {
      const email =
        data.email_addresses?.find(
          (e: any) => e.id === data.primary_email_address_id
        )?.email_address || data.email_addresses?.[0]?.email_address;

      if (!email) {
        this.logger.error("No email found in user data");
        return;
      }

      const name = data.first_name
        ? `${data.first_name} ${data.last_name || ""}`.trim()
        : data.username || email;

      const defaultPlan = this.configService.get<string>(
        "DEFAULT_USER_PLAN",
        "free"
      );

      await this.db.insert(users).values({
        clerkUserId: data.id,
        email,
        name,
        plan: defaultPlan,
      });

      this.logger.log(`User created: ${email} (Clerk ID: ${data.id})`);
    } catch (error) {
      this.logger.error("Failed to create user", error);
    }
  }

  async handleUserUpdated(data: any): Promise<void> {
    try {
      const email =
        data.email_addresses?.find(
          (e: any) => e.id === data.primary_email_address_id
        )?.email_address || data.email_addresses?.[0]?.email_address;

      const name = data.first_name
        ? `${data.first_name} ${data.last_name || ""}`.trim()
        : data.username || email;

      await this.db
        .update(users)
        .set({
          email,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, data.id));

      this.logger.log(`User updated: ${email} (Clerk ID: ${data.id})`);
    } catch (error) {
      this.logger.error("Failed to update user", error);
    }
  }

  async handleUserDeleted(data: any): Promise<void> {
    try {
      await this.db.delete(users).where(eq(users.clerkUserId, data.id));
      this.logger.log(`User deleted: Clerk ID ${data.id}`);
    } catch (error) {
      this.logger.error("Failed to delete user", error);
    }
  }

  async sendDiscordNotification(
    feedback: Feedback,
    webhookUrl?: string
  ): Promise<void> {
    const discordWebhookUrl = this.configService.get<string>(
      "DISCORD_WEBHOOK_URL"
    );

    if (!webhookUrl && !discordWebhookUrl) {
      this.logger.debug("No Discord webhook URL configured");
      return;
    }

    const url = webhookUrl || discordWebhookUrl!;

    try {
      const embed = {
        title: "🚨 Negative Feedback Received",
        description: feedback.text.substring(0, 1000),
        color: 0xff0000,
        fields: [
          {
            name: "Rating",
            value: `${"⭐".repeat(feedback.rating)} (${feedback.rating}/5)`,
            inline: true,
          },
          {
            name: "Category",
            value: feedback.category,
            inline: true,
          },
          {
            name: "Sentiment",
            value: `${feedback.sentiment} (${Math.round(feedback.sentimentScore * 100)}%)`,
            inline: true,
          },
          {
            name: "Feedback ID",
            value: feedback.id,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        throw new Error(`Discord API returned ${response.status}`);
      }

      this.logger.log("Discord notification sent successfully");
    } catch (error) {
      this.logger.error("Failed to send Discord notification", error);
    }
  }
}
