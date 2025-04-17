import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { Express } from 'express';
@Injectable()
export class UsersService {
  constructor(private readonly httpService: HttpService) {}

  async updateUserProfile(updateUserDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/users/update-profile', updateUserDto),
    );
    return response.data;
  }

  async updateAvatar(id: number, file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      contentType: file.mimetype,
      filename: file.originalname
    });
    const response = await firstValueFrom(
      this.httpService.post(`/users/update-avatar/${id}`, {
        headers: {
          ...formData.getHeaders(),
        },
        data: formData,
      }),
    );
    return response.data;
    // return true;
  }

  async getUserProfile(id: number): Promise<any> {
    const response = await firstValueFrom(this.httpService.get(`/users/${id}`));
    return response.data;
  }
}
