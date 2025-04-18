import { Injectable, NestMiddleware } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KeycloakMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const publicRoutes = [
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
    console.log("Getting: ", req.url);
    if (publicRoutes.includes(req.url)) return next();

    const authHeader = req.headers.authorization as string;
    const token = req.cookies?.rptToken || (authHeader && authHeader.split(' ')[1]);
    if (!token) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ message: 'No token provided' }));
    }

    // console.log("cookies: ", req.cookies);

    try {
      let decoded = jwt.decode(token) as any;
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < currentTime) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'No refresh token found' }));
        }

        const refreshTokenDecoded = jwt.decode(refreshToken) as any;
        if (refreshTokenDecoded.exp && refreshTokenDecoded.exp < currentTime) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'Refresh token has expired' }));
        }

        // const AUTH_DOMAIN = 'http://localhost:3003';
        const AUTH_DOMAIN = 'http://34.58.241.34:3003';
        const result = await fetch(`${AUTH_DOMAIN}/Users/refresh_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.cookie || ''
          },
          body: JSON.stringify({ "refresh_token": refreshToken }),
          credentials: 'include' // Include cookies in request and handle cookies in response
        });

        //Set cookies for client
        res.removeHeader('Set-Cookie');
        const setCookies = result.headers.getSetCookie ? result.headers.getSetCookie() : [];
        // Properly set cookies in response
        setCookies.forEach(cookie => {
          // Ensure cookie is correctly formatted for the client domain
          const modifiedCookie = cookie
            .replace('Domain=localhost', `Domain=${req.headers.host.split(':')[0]}`);
          res.appendHeader('Set-Cookie', modifiedCookie);
        });

        //update the token
        const tokenResponse = await result.json();
        const newToken = tokenResponse.rptAccessToken;
        decoded = jwt.decode(newToken) as any;

        // Update request with new token
        req.cookies.rptToken = newToken;
        if (authHeader) {
          req.headers.authorization = `Bearer ${newToken}`;
        }

        if (!result.ok) {
          console.log("IWASHERE");
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'Refresh token has expired' }));
        }

        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Refresh token has expired' }));
      }

      if (!decoded) {
        console.log("IWASHERE2");
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Invalid token' }));
      }

      if (!decoded.email_verified) {
        console.log("IWASHERE3");
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Email is not verified' }));
      }

      const roles: string[] = decoded.realm_access?.roles || [];
      const mappedPermissions: string[] = [];

      if (decoded.authorization?.permissions) {
        decoded.authorization.permissions.forEach((p: any) => {
          if (p.scopes) {
            p.scopes.forEach((scope: string) => {
              mappedPermissions.push(`${p.rsname}#${scope}`);
            });
          } else if (p.rsname) {
            mappedPermissions.push(p.rsname);
          }
        });
      }

      req.userInfo = {
        roles,
        permissions: mappedPermissions,
        email: decoded.email || '',
        username: decoded.username || '',
        password: decoded.password || '',
      };

      next();
    } catch (error) {
      console.log(error);
      console.log("IWASHERE4");
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ message: 'Invalid authorization token' }));
    }
  }
}
