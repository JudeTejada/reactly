-- Remove plaintext API key column
ALTER TABLE "projects" DROP COLUMN "api_key";

-- Add key version column for deterministic key generation
ALTER TABLE "projects" ADD COLUMN "key_version" integer NOT NULL DEFAULT 1;