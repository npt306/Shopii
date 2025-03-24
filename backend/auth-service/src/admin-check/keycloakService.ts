import { Injectable } from "@nestjs/common";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

@Injectable()
export class KeycloakService {
    private keycloakAdminClient: KeycloakAdminClient;

    constructor() {
        this.keycloakAdminClient = new KeycloakAdminClient({
            baseUrl: process.env.KEYCLOAK_BASE_URL,
            realmName: process.env.KEYCLOAK_REALM || 'shopii',
        });
    }

    async init() {
        if (!process.env.KEYCLOAK_CLIENT_ID) {
            throw new Error('KEYCLOAK_CLIENT_ID environment variable is not defined');
        }

        await this.keycloakAdminClient.auth({
            grantType: 'client_credentials',
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
        })
    }


    async isOTPProperlyConfigured(userId: string): Promise<boolean> {
        try {
            // console.log(`Checking OTP configuration for user ID: ${userId}`);
            try {
                // console.log(`Fetching credentials for user ID: ${userId}`);
                const credentials = await this.keycloakAdminClient.users.getCredentials({
                    id: userId,
                });
                // console.log(`Credentials retrieved: ${JSON.stringify(credentials)}`);
                // Check for OTP credential
                const hasOtp = credentials.some(credential => {
                    return credential.type === 'otp' && 
                        !!credential.credentialData; //credentialData is in json format
                });
                return hasOtp;
            } catch (error) {
                console.error(`Error getting credentials for user ${userId}:`, error);
                // If we can't access credentials, assume OTP is not configured
                return false;
            }
        } catch (error) {
            console.error('Error in isOTPProperlyConfigured:', error);
            // For security, default to assuming OTP is not configured if we can't verify
            return false;
        }
    }
}