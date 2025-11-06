import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { createClerkClient, verifyToken } from "@clerk/backend";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    // Debug logging
    this.logger.debug(`Request path: ${request.path}`);
    this.logger.debug(`Auth header present: ${!!request.headers.authorization}`);
    this.logger.debug(`Cookie header present: ${!!request.headers.cookie}`);
    this.logger.debug(`Token extracted: ${token ? 'Yes (length: ' + token.length + ')' : 'No'}`);

    if (!token) {
      this.logger.warn(`No token found for ${request.path}`);
      throw new UnauthorizedException("No authentication token provided");
    }

    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.error('CLERK_SECRET_KEY not configured!');
      throw new UnauthorizedException("Server configuration error");
    }

    try {
      this.logger.debug('Verifying token with Clerk...');
      const verified = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      
      this.logger.debug(`Token verified for user: ${verified.sub}`);
      
      // Fetch full user data from Clerk
      try {
        const clerkUser = await this.clerkClient.users.getUser(verified.sub);
        request.user = {
          userId: verified.sub,
          clerkUserId: verified.sub,
          sessionId: verified.sid,
          email: clerkUser.emailAddresses[0]?.emailAddress || null,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        };
      } catch (userError) {
        this.logger.warn(`Could not fetch user details: ${userError.message}`);
        // Fallback to basic user info
        request.user = {
          userId: verified.sub,
          clerkUserId: verified.sub,
          sessionId: verified.sid,
          email: null,
          name: null,
        };
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      this.logger.debug(`Token starts with: ${token.substring(0, 20)}...`);
      throw new UnauthorizedException("Invalid authentication token");
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/__session=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
