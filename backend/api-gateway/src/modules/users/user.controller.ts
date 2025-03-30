import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  MemoryStorageFile,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import { UsersService } from './user.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('update-profile')
  async updateUserProfile(@Body() getUserDto: any): Promise<any> {
    return this.usersService.updateUserProfile(getUserDto);
  }

  @Post('update-avatar/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: { file?: MemoryStorageFile },
  ): Promise<any> {
    if (files.file) return this.usersService.updateAvatar(id, files.file);
    return true;
  }

  @Get(':id')
  async getProfile(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.usersService.getUserProfile(id);
  }
}
