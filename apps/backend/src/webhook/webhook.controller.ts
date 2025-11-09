import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
  RawBodyRequest,
  Req,
  Inject,
} from "@nestjs/common";
import { Request } from "express";
import { WebhookService } from "./webhook.service";
import { Webhook } from "svix";
import { ConfigService } from "@nestjs/config";

@Controller("webhook")
export class WebhookController {  
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Post("clerk")
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Missing svix headers");
    }

    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error("CLERK_WEBHOOK_SECRET not configured");
      throw new BadRequestException("Webhook secret not configured");
    }

    try {
      const wh = new Webhook(webhookSecret);
      const evt = wh.verify(JSON.stringify(payload), {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;

      const eventType = evt.type;
      this.logger.log(`Received Clerk webhook: ${eventType}`);

      switch (eventType) {
        case "user.created":
          await this.webhookService.handleUserCreated(evt.data);
          break;
        case "user.updated":
          await this.webhookService.handleUserUpdated(evt.data);
          break;
        case "user.deleted":
          await this.webhookService.handleUserDeleted(evt.data);
          break;
        default:
          this.logger.debug(`Unhandled webhook event: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error("Webhook verification failed", error);
      throw new BadRequestException("Invalid webhook signature");
    }
  }
}
