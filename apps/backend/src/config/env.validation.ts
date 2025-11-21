import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  CLERK_SECRET_KEY: Joi.string().required(),
  CLERK_PUBLISHABLE_KEY: Joi.string().required(),
  CLERK_WEBHOOK_SECRET: Joi.string().required(),
  GLM_API_KEY: Joi.string().optional(),
  GEMINI_API_KEY: Joi.string().optional(),
  DISCORD_WEBHOOK_URL: Joi.string().uri().optional(),
  ALLOWED_ORIGINS: Joi.string().required(),
  API_KEY_DETERMINISTIC_SECRET: Joi.string().required(),
  API_KEY_ENCRYPTION_SECRET: Joi.string().required(),
  API_KEY_ENCRYPTION_SALT_ROUNDS: Joi.string().required(),
  API_KEY_ENCRYPTION_ALGORITHM: Joi.string().required(),
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
  DEFAULT_USER_PLAN: Joi.string().default("free"),
});
