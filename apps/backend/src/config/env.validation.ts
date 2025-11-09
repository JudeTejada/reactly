import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  CLERK_SECRET_KEY: Joi.string().required(),
  CLERK_PUBLISHABLE_KEY: Joi.string().required(),
  GEMINI_API_KEY: Joi.string().required(),
  DISCORD_WEBHOOK_URL: Joi.string().uri().optional(),
  ALLOWED_ORIGINS: Joi.string().required(),
});
