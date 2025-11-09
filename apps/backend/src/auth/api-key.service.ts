import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { generateApiKey } from '@reactly/shared';

@Injectable()
export class ApiKeyService {
  private readonly saltRounds = 12;

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
   * Generate a new API key
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
}