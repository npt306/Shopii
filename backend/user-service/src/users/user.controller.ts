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
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('update-profile')
  updateProfile(@Body() getUserDto: UserDto) {
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
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserProfile(id);
  }
  
}
