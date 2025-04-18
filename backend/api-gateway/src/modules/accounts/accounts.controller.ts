import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query, Put, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PermissionsGuard } from 'src/guard/permission.guard';

@Controller('api/accounts')
@UseGuards(PermissionsGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async fetchUsersBatch(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<any> {
    console.log('iwashere')
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.accountsService.fetchUsersBatch(pageNum, limitNum);
  }

  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<any>,
  ): Promise<any> {
    return this.accountsService.updateUser(id, updateData);
  }

  @Patch(':id/ban')
  async banUser(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountsService.banUser(id);
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountsService.unbanUser(id);
  }

  @Get('role/:role')
  async fetchUsersByRole(@Param('role') role: string): Promise<any> {
    return this.accountsService.fetchUsersByRole(role);
  }

  @Get(':id/details')
  async getUserDetails(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountsService.getUserDetails(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.accountsService.deleteUser(id);
  }

  @Patch(':id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<any> {
    return this.accountsService.updateUserStatus(id, status);
  }
}