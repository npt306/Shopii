import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err || !user) {
      // Log the error and additional info (if available)
      this.logger.error('JWT authentication error', err || info);
      // Optionally, you can throw the error to propagate it
      throw err || info;
    }
    return user;
  }
}
