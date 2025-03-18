import { KeycloakConnectOptions, KeycloakConnectModule } from 'nest-keycloak-connect';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const keycloakConfigAsync = KeycloakConnectModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): KeycloakConnectOptions => ({
    authServerUrl: configService.get('KEYCLOAK_AUTH_SERVER_URL'),
    realm: configService.get('KEYCLOAK_REALM'),
    clientId: configService.get('KEYCLOAK_CLIENT_ID'),
    secret: configService.get('KEYCLOAK_CLIENT_SECRET') || '',
  }),
});
