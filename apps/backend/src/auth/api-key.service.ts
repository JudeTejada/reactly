import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { generateApiKey } from "@reactly/shared";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApiKeyService {
  private readonly deterministicSecret: string;
  private readonly encryptionSecret: string;
  private readonly saltRounds: number;
  private readonly algorithm: string;
  constructor(private readonly configService: ConfigService) {
    this.deterministicSecret = this.configService.get(
      "API_KEY_DETERMINISTIC_SECRET"
    )!;
    this.encryptionSecret = this.configService.get(
      "API_KEY_ENCRYPTION_SECRET"
    )!;
    this.saltRounds = this.configService.get("API_KEY_ENCRYPTION_SALT_ROUNDS")!;
    this.algorithm = this.configService.get("API_KEY_ENCRYPTION_ALGORITHM")!;
  }

  /**
   * Hash an API key using bcrypt
   */
  async hashApiKey(apiKey: string): Promise<string> {
    return bcrypt.hash(apiKey, this.saltRounds);
  }

  /**
   * Verify an API key against its hash
   */
  async verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
    return bcrypt.compare(apiKey, hash);
  }

  /**
   * Generate a deterministic API key based on project ID and version
   * This ensures we can always reconstruct the API key without storing plaintext
   */
  generateDeterministicApiKey(projectId: string, version: number = 1): string {
    // Create HMAC using project ID, version, and secret
    const hmac = crypto.createHmac("sha256", this.deterministicSecret);
    hmac.update(`${projectId}-${version}`);
    const hash = hmac.digest("hex");

    // Take first 32 characters and format as API key
    const keyPart = hash.substring(0, 32);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let apiKey = "rly_";

    for (let i = 0; i < keyPart.length; i += 2) {
      const byteValue = parseInt(keyPart.substr(i, 2), 16);
      apiKey += chars.charAt(byteValue % chars.length);
    }

    return apiKey;
  }

  /**
   * Generate a new random API key (for backward compatibility)
   */
  generateApiKey(): string {
    return generateApiKey();
  }

  /**
   * Generate and hash a new API key pair
   */
  async generateApiKeyPair(): Promise<{ plainKey: string; hashedKey: string }> {
    const plainKey = this.generateApiKey();
    const hashedKey = await this.hashApiKey(plainKey);
    return { plainKey, hashedKey };
  }

  /**
   * Generate and hash a deterministic API key pair for a project
   */
  async generateDeterministicApiKeyPair(
    projectId: string,
    version: number = 1
  ): Promise<{ plainKey: string; hashedKey: string }> {
    const plainKey = this.generateDeterministicApiKey(projectId, version);
    const hashedKey = await this.hashApiKey(plainKey);
    return { plainKey, hashedKey };
  }

  /**
   * Get a properly sized encryption key using PBKDF2
   */
  private getEncryptionKey(): Buffer {
    return crypto.pbkdf2Sync(
      this.encryptionSecret,
      "salt",
      10000,
      32,
      "sha256"
    );
  }

  /**
   * Encrypt an API key for secure storage
   */
  encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(apiKey, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypt an API key for retrieval
   */
  decryptApiKey(encryptedApiKey: string): string {
    const textParts = encryptedApiKey.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = textParts.join(":");
    const key = this.getEncryptionKey();
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Generate API key pair with encryption for storage
   */
  async generateApiKeyPairWithEncryption(): Promise<{
    plainKey: string;
    hashedKey: string;
    encryptedKey: string;
  }> {
    const { plainKey, hashedKey } = await this.generateApiKeyPair();
    const encryptedKey = this.encryptApiKey(plainKey);
    return { plainKey, hashedKey, encryptedKey };
  }
}
