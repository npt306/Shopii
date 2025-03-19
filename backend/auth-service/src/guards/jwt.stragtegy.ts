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
    // const publicKey = process.env.JWT_PUBLIC_KEY;
    const rawKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApOb0nhSDQYnoD4/3edYV1MEgKPK2+d45RJOgT2QMpNSiETJkL3DsnR8IO6jzsM+YNsOtE65ZoXfY03gAn7PmjwwGrABkalbDDEO03ZNhn6HM4sxXbFM6CnCl3flnETyqIcWW0tIndOrolVESeoTYNWkxLb+4zh3Ga5TlsX0Wiof+69bTHKUxPJcHtS1FJ9BGS5XE8Hoiwk/p9zzko68f7yS0sKKqIUc5/sjfWnzOxN19aWmZp/wooDxDK+3kzegILM34v11baadsFEvFb0dlQcOC3nEj1GMVMk435hEyGKWvA+w0zURkEodAv2iJ81tmWrUzrRcpcYoWB2chBiAH+QIDAQAB";
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${rawKey}\n-----END PUBLIC KEY-----`;
    
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