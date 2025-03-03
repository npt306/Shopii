import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve the required roles from the metadata
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles are required, allow the request
      return true;
    }

    // Retrieve the user object set by your FirebaseAuthGuard
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.role && !user.roles)) {
      throw new ForbiddenException('Insufficient permissions: no role found');
    }

    // Determine user's roles (supporting both a single role or multiple roles)
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

    // Check if any of the user's roles match the required roles
    const hasRole = userRoles.some(role => requiredRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
