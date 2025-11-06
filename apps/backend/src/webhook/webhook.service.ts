import { Injectable, Logger } from "@nestjs/common";
import type { Feedback } from "../db/schema";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async sendDiscordNotification(
    feedback: Feedback,
    webhookUrl?: string
  ): Promise<void> {
    if (!webhookUrl && !process.env.DISCORD_WEBHOOK_URL) {
      this.logger.debug("No Discord webhook URL configured");
      return;
    }

    const url = webhookUrl || process.env.DISCORD_WEBHOOK_URL!;

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
