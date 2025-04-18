import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PERMISSIONS_MAPPING } from 'src/config/permission.config';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Log only crucial parts of the request
    this.logger.log(`Processing request: ${request.method} ${request.url}`);

    const user = request.user || request.userInfo || request.raw?.userInfo;
    if (user) {
      this.logger.log(`User email: ${user.email}`);
    } else {
      this.logger.warn('User object not found in request');
    }
    
    // Get path without query parameters
    const currentPath = request.url.split('?')[0];
    this.logger.log(`Current path: ${currentPath}`);
    
    // Find required permission based on path pattern matching
    let requiredPermission: string | string[] | null = null;
    let matchedPattern: string | null = null;
    
    // Check for exact matches first
    if (PERMISSIONS_MAPPING[currentPath]) {
      requiredPermission = PERMISSIONS_MAPPING[currentPath];
      matchedPattern = currentPath;
    } else {
      // Then try pattern matching for routes with parameters
      for (const pattern of Object.keys(PERMISSIONS_MAPPING)) {
        // Convert the pattern to regex
        const regexPattern = pattern
          .replace(/\//g, '\\/') // Escape forward slashes
          .replace(/:\w+/g, '[^/]+'); // Replace :param with a regex pattern
          
        const regex = new RegExp(`^${regexPattern}$`);
        
        if (regex.test(currentPath)) {
          requiredPermission = PERMISSIONS_MAPPING[pattern];
          matchedPattern = pattern;
          break;
        }
      }
    }
    
    if (matchedPattern) {
      this.logger.log(`Matched route pattern: ${matchedPattern}`);
    }
    
    // If no permissions required, allow access
    if (!requiredPermission) {
      this.logger.log('No permissions required for this route');
      return true;
    }

    // Verify user has permissions
    if (!user || !user.permissions) {
      this.logger.warn('User has no permissions defined');
      throw new ForbiddenException('User has no permissions');
    }

    const requiredPermissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const userPermissions: string[] = user.permissions;
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    this.logger.log(`Required permissions: ${JSON.stringify(requiredPermissions)}`);
    this.logger.log(`Has all permissions: ${hasAllPermissions}`);

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
