import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PERMISSIONS_MAPPING } from 'src/config/permission.config';

@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Use the request's route path as the key (ensure it matches your mapping)
    const currentRoute = request.route?.path;
    const requiredPermission = PERMISSIONS_MAPPING[currentRoute];

    // If the route doesn't require permissions, allow access
    if (!requiredPermission) {
      return true;
    }

    if (!user || !user.permissions) {
      throw new ForbiddenException('User has no permissions.');
    }

    const requiredPermissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const userPermissions: string[] = user.permissions;
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}
