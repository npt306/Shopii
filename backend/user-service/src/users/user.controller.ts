import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Get,
  UseInterceptors,
  UploadedFile,
  Req
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
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
  }))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Promise<any> {
    const imageStream = body.data._streams[1];
    const fileBuffer = Buffer.from(imageStream.data);
    return this.usersService.updateAvatar(id, fileBuffer);
  }

  @Get(':id')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserProfile(id);
  }
  
}
