import { Controller, Get, Put, Patch, Param, Query, Body, Delete } from '@nestjs/common';
import { AccountManagementService } from './accounts-management.service';

@Controller('accounts')
export class AccountManagementController {
  constructor(private readonly accountManagementService: AccountManagementService) { }

  /**
   * GET /accounts/accounts
   * Fetch users in batches with pagination.
   * Query Params:
   *  - page: The page number (optional, default is 1)
   *  - limit: The number of records per page (optional, default is 10)
   */
  @Get('accounts')
  async fetchUsersBatch(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.accountManagementService.fetchUsersBatch(pageNum, limitNum);
  }

  /**
   * PUT /user-management/:accountId
   * Update a user's information.
   * Request Body: An object with the fields to update.
   */
  @Put(':accountId')
  async updateUser(
    @Param('accountId') accountId: string,
    @Body() updateData: Partial<any>,
  ) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.updateUser(id, updateData);
  }

  /**
   * PATCH /user-management/:accountId/ban
   * Ban a user.
   */
  @Patch(':accountId/ban')
  async banUser(@Param('accountId') accountId: string) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.banUser(id);
  }

  @Patch(':accountId/unban')
  async unbanUser(@Param('accountId') accountId: string) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.unbanUser(id);
  }

  @Get('role/:role')
  async fetchUsersByRole(@Param('role') role: string) {
    return await this.accountManagementService.fetchUsersByRole(role);
  }

  @Get(':accountId/details')
  async getUserDetails(@Param('accountId') accountId: string) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.getUserDetails(id);
  }

  @Delete(':accountId')
  async deleteUser(@Param('accountId') accountId: string) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.deleteUser(id);
  }


  @Patch(':accountId/status')
  async updateUserStatus(
    @Param('accountId') accountId: string,
    @Body('status') status: string,
  ) {
    const id = parseInt(accountId, 10);
    return await this.accountManagementService.updateUserStatus(id, status);
  }

}
