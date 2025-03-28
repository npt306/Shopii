import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AccountsService {
  constructor(private readonly httpService: HttpService) {}

  async fetchUsersBatch(page: number, limit: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/accounts/accounts?page=${page}&limit=${limit}`)
    );
    return response.data;
  }

  async updateUser(id: number, updateData: Partial<any>): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.put(`/accounts/${id}`, updateData)
    );
    return response.data;
  }

  async banUser(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/accounts/${id}/ban`, {})
    );
    return response.data;
  }

  async unbanUser(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/accounts/${id}/unban`, {})
    );
    return response.data;
  }

  async fetchUsersByRole(role: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/accounts/role/${role}`)
    );
    return response.data;
  }

  async getUserDetails(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/accounts/${id}/details`)
    );
    return response.data;
  }

  async deleteUser(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/accounts/${id}`)
    );
    return response.data;
  }

  async updateUserStatus(id: number, status: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/accounts/${id}/status`, { status })
    );
    return response.data;
  }
}