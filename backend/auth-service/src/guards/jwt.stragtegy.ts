import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    // Load your public key from a file or environment variable
    const publicKey = process.env.JWT_PUBLIC_KEY;
    
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['rptToken'];
          }
          console.log('Token:', token);
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'], // Expect RS256 now
    });
  }

  async validate(payload: any) {
    this.logger.log('Validated JWT payload: ' + JSON.stringify(payload));
    return payload;
  }
}