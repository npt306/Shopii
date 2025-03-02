import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve the required roles from the metadata
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      // If no roles are required, allow the request
      return true;
    }
    
    // Retrieve the user object set by your FirebaseAuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Insufficient permissions: no role found');
    }

    // Check if the user's role is among the allowed roles
    if (roles.includes(user.role)) {
      return true;
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
