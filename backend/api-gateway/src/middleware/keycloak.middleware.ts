import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakMiddleware implements NestMiddleware {
  // 1) Fully public (static) endpoints
  private publicStaticRoutes = [
    '/Users/login',
    '/Users/register',
    '/Users/register-shop',
    '/Users/login-admin',
    '/Users/verify-otp',
    '/Users/auth/exchange-token',
    '/Users/send-verification-email',
    '/Users/me',
    '/Users/refresh_token',
    '/api/product/list',
  ];

  // 3) Public endpoints with dynamic params
  private publicDynamicPatterns: RegExp[] = [
    /^\/order\/carts\/[^\/]+$/,                // /order/carts/:id
    /^\/order\/carts\/basic\/[^\/]+$/,         // /order/carts/basic/:id
    /^\/api\/product\/detail\/[^\/]+$/,        // /api/product/detail/:id
  ];

  async use(req: any, res: any, next: () => void) {
    // *** OPTIONS preflight always passes through
    if (req.method === 'OPTIONS') {
      return next();
    }

    // *** 1) Skip static public routes
    console.log('Incoming URL:', req.url);
    if (this.publicStaticRoutes.includes(req.url)) {
      return next();
    }

    // *** 2) Token extraction & refresh if expired
    const authHeader = req.headers.authorization as string;
    let token = req.cookies?.rptToken || (authHeader && authHeader.split(' ')[1]);

    if (!token) {
      return res
        .status(401)
        .json({ message: 'No token provided' });
    }

    // Decode (to inspect exp) — use decode only, not verify, so we can catch expiry
    let decoded: any = jwt.decode(token);
    const now = Math.floor(Date.now() / 1000);

    if (decoded?.exp && decoded.exp < now) {
      // access token expired → try to refresh
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: 'No refresh token found' });
      }

      const refreshDecoded: any = jwt.decode(refreshToken);
      if (refreshDecoded?.exp && refreshDecoded.exp < now) {
        return res
          .status(401)
          .json({ message: 'Refresh token has expired' });
      }

      // call your auth server to refresh
      const AUTH_DOMAIN = 'http://34.58.241.34:3003';
      const result = await fetch(`${AUTH_DOMAIN}/Users/refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || ''
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: 'include',
      });

      if (!result.ok) {
        return res
          .status(401)
          .json({ message: 'Unable to refresh token' });
      }

      // set new cookies from response
      const setCookies = result.headers.getSetCookie?.() || [];
      setCookies.forEach((c) => {
        // adapt domain if needed
        const cookie = c.replace('Domain=localhost', `Domain=${req.headers.host.split(':')[0]}`);
        res.appendHeader('Set-Cookie', cookie);
      });

      // read new access token and decode again
      const { rptAccessToken: newToken } = await result.json();
      token = newToken;
      decoded = jwt.decode(token);
      // update request for later use
      req.cookies.rptToken = newToken;
      if (authHeader) {
        req.headers.authorization = `Bearer ${newToken}`;
      }
    }

    // *** 3) Skip dynamic public routes
    if (this.publicDynamicPatterns.some((re) => re.test(req.url))) {
      return next();
    }

    // *** 4) Protected section: decode checks, roles & permissions
    if (!decoded) {
      return res
        .status(401)
        .json({ message: 'Invalid token' });
    }

    if (!decoded.email_verified) {
      return res
        .status(401)
        .json({ message: 'Email is not verified' });
    }

    const roles: string[] = decoded.realm_access?.roles || [];
    const permissions: string[] = [];
    (decoded.authorization?.permissions || []).forEach((p: any) => {
      if (p.scopes) {
        p.scopes.forEach((s: string) => permissions.push(`${p.rsname}#${s}`));
      } else if (p.rsname) {
        permissions.push(p.rsname);
      }
    });

    // attach to request and proceed
    req.userInfo = {
      roles,
      permissions,
      email: decoded.email,
      username: decoded.username,
    };

    return next();
  }
}
