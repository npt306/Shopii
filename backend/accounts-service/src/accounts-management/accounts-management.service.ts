import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entity/Account.entity';
import KcAdminClient from 'keycloak-admin';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { Seller } from 'src/entity/seller.entity';
import { Address } from 'src/entity/address.entity';

@Injectable()
export class AccountManagementService {
    private kcAdminClient: KcAdminClient;

    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,

        @InjectRepository(Seller)
        private readonly sellerRepository: Repository<Seller>,

        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>,
    ) {
        // Initialize the Keycloak Admin Client with base settings.
        this.kcAdminClient = new KcAdminClient({
            baseUrl: process.env.KEYCLOAK_BASE_URL || 'https://sso-shopii.ddns.net',
            realmName: process.env.KEYCLOAK_REALM || 'shopii',
        });
    }

    private async initKeycloak(): Promise<void> {
        try {
            await this.kcAdminClient.auth({
                grantType: 'client_credentials',
                clientId: process.env.KEYCLOAK_CLIENT_ID || 'shopii',
                clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '22myCSnkzM0MsTEX3ZuFmPU7Gj6ivTCU',
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to authenticate with Keycloak');
        }
    }

    async fetchUsersBatch(page: number = 1, limit: number = 10): Promise<Account[]> {
        const [users] = await this.accountRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { CreatedAt: 'DESC' },
        });
        return users;
    }


    async updateUser(accountId: number, updateData: Partial<Account>): Promise<Account> {
        const user = await this.accountRepository.findOneBy({ AccountId: accountId });
        if (!user) {
            throw new NotFoundException(`User with id ${accountId} not found.`);
        }
        Object.assign(user, updateData);
        return await this.accountRepository.save(user);
    }


    async banUser(accountId: number): Promise<Account> {
        const user = await this.accountRepository.findOneBy({ AccountId: accountId });
        if (!user) {
            throw new NotFoundException(`User with id ${accountId} not found.`);
        }
        user.Status = 'Banned';
        return await this.accountRepository.save(user);
    }


    async unbanUser(accountId: number): Promise<Account> {
        const user = await this.accountRepository.findOneBy({ AccountId: accountId });
        if (!user) {
            throw new NotFoundException(`User with id ${accountId} not found.`);
        }
        user.Status = 'Active'; // Adjust this value based on your application logic.
        return await this.accountRepository.save(user);
    }

    async fetchUsersByRole(role: string): Promise<any[]> {
        await this.initKeycloak();
        try {
            // First, fetch users from Keycloak by role
            const allKeycloakUsers = await this.kcAdminClient.users.find();
            const roles = await this.kcAdminClient.roles.find();
            if (!roles || roles.length === 0) {
                throw new NotFoundException(`No roles found in Keycloak`);
            }
            const targetRole = roles.find(r => r.name === role);
            if (!targetRole) {
                throw new NotFoundException(`Exact role match for '${role}' not found in Keycloak`);
            }

            const usersWithRole: UserRepresentation[] = [];
            for (const user of allKeycloakUsers) {
                if (user.id) {
                    const userRoles = await this.kcAdminClient.users.listRealmRoleMappings({ id: user.id });
                    if (userRoles.some(r => r.id === targetRole.id)) {
                        usersWithRole.push(user);
                    }
                }
            }

            // Now merge with local Accounts data (assuming Accounts has an Email field to join on)
            const mergedUsers: Array<UserRepresentation & Partial<Account>> = [];
            for (const keycloakUser of usersWithRole) {
                // Use email as the matching criteria
                const account = await this.accountRepository.findOneBy({ Email: keycloakUser.email });
                console.log(account);
                // Merge the keycloak user with the local account details
                mergedUsers.push({ ...keycloakUser, ...(account || {}) });
            }

            return mergedUsers;
        } catch (error) {
            console.error('Keycloak error:', error);
            throw new InternalServerErrorException(`Failed to fetch users for role ${role}: ${error.message}`);
        }
    }

    async getUserDetails(accountId: number): Promise<Account> {
        const user = await this.accountRepository.findOne({
            where: { AccountId: accountId },
        });

        const sellerInfo = await this.sellerRepository.findOne({
            where: { id: accountId },
        })

        const addressInfo = await this.addressRepository.findOne({
            where: { AccountId: accountId },
        })

        if (!user) {
            throw new NotFoundException(`User with id ${accountId} not found.`);
        }

        return {
            ...user,
            ...(sellerInfo ? { seller: sellerInfo } : {}),
            ...(addressInfo ? { address: addressInfo } : {})
        };
    }

    async deleteUser(id: number): Promise<any> {
        try {
            // Find the user in the database to verify it exists
            const user = await this.accountRepository.findOneBy({ AccountId: id });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // Initialize Keycloak admin client
            await this.initKeycloak();

            // Find the user in Keycloak by email
            const keycloakUsers = await this.kcAdminClient.users.find({ email: user.Email });

            //$1-> placeholder used in parameterized SQL queries. 
            // When the query is executed, the value provided in the array (in this case, [id]) replaces $1
            // Use a transaction to ensure all database operations succeed or fail together
            await this.accountRepository.manager.transaction(async transactionalEntityManager => {
                // Delete from Users table
                await transactionalEntityManager.query(
                    `DELETE FROM "Users" WHERE "id" = $1`,
                    [id]
                );

                // Delete from Seller table if it exists
                await transactionalEntityManager.query(
                    `DELETE FROM "Sellers" WHERE "id" = $1`,
                    [id]
                );

                // Delete from Address table if it exists
                await transactionalEntityManager.query(
                    `DELETE FROM "Addresses" WHERE "AccountId" = $1`,
                    [id]
                );

                // Delete the account itself
                await transactionalEntityManager.delete(Account, { AccountId: id });
            });

            // Delete the user from Keycloak 
            if (keycloakUsers && keycloakUsers.length > 0) {
                const keycloakUserId = keycloakUsers[0].id;
                if (keycloakUserId) {
                    await this.kcAdminClient.users.del({ id: keycloakUserId });
                } else {
                    throw new Error('Keycloak user ID is undefined');
                }
            }

            return {
                success: true,
                message: `User with ID ${id} successfully deleted`,
            };
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async updateUserStatus(id: number, status: string): Promise<any> {
        try {
            // Validate status value
            if (status !== 'active' && status !== 'inactive') {
                throw new Error('Invalid status. Status must be "active" or "inactive"');
            }

            // Find the user in the database
            const user = await this.accountRepository.findOneBy({ AccountId: id });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // Update status in PostgreSQL
            user.Status = status;
            const updatedUser = await this.accountRepository.save(user);

            return {
                success: true,
                message: `User status updated to ${status}`,
                user: updatedUser
            };
        } catch (error) {
            throw new Error(`Failed to update user status: ${error.message}`);
        }
    }
}
