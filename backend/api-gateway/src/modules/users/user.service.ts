import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

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
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await firstValueFrom(
      this.httpService.post(`/users/update-avatar/${id}`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      }),
    );
    return response.data;
  }

  async getUserProfile(id: number): Promise<any> {
    const response = await firstValueFrom(this.httpService.get(`/users/${id}`));
    return response.data;
  }
}
