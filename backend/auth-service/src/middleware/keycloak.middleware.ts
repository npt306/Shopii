import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip middleware for public routes
    if (req.path === '/Users/login'
      || req.path === '/Users/register'
      || req.path === '/Users/register-shop'
      || req.path === '/Users/login-admin'
      || req.path === '/Users/verify-otp'
      || req.path === '/Users/auth/exchange-token'
      || req.path === '/Users/send-verification-email'
      || req.path === '/Users/me'
      || req.path === '/Users/login-admin'
    ) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = req.cookies.accessToken || (authHeader && authHeader.split(' ')[1]);
    if (!token) {
      throw new UnauthorizedException('No authorization token found');
    }

    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      if (!decoded.email_verified) {
        throw new UnauthorizedException('Email is not verified.');
      }

      // Extract roles from realm_access
      const roles: string[] = decoded.realm_access?.roles || [];

      console.log('Roles:', roles);

      // Extract permissions from authorization.permissions
      const mappedPermissions: string[] = [];
      if (decoded.authorization?.permissions) {
        decoded.authorization.permissions.forEach((p: any) => {
          // For permissions with scopes
          if (p.scopes) {
            p.scopes.forEach((scope: string) => {
              mappedPermissions.push(`${p.rsname}#${scope}`);
            });
          }
          // For permissions without scopes (just resource access)
          else if (p.rsname) {
            mappedPermissions.push(p.rsname);
          }
        });
      }

      console.log('Permissions:', mappedPermissions);

      // Add user info to request
      req.user = {
        roles: roles,
        permissions: mappedPermissions,
        email: decoded.email || '',
        username: decoded.username || '',
        password: decoded.password || '',
      };

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }
}
