import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './user.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('update-profile')
  async updateUserProfile(@Body() getUserDto: any): Promise<any> {
    return this.usersService.updateUserProfile(getUserDto);
  }

  @Post('update-avatar/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return this.usersService.updateAvatar(id, file);
  }

  @Get(':id')
  async getProfile(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.usersService.getUserProfile(id);
  }
  
}
