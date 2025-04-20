import { Injectable, NotFoundException,HttpException, HttpStatus} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Storage, Bucket } from '@google-cloud/storage';

@Injectable()
export class UserService {
  private bucket: Bucket;
  storage: Storage;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const privateKey = process.env.GCLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GCLOUD_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error(
        'GCLOUD_PRIVATE_KEY or GCLOUD_CLIENT_EMAIL environment variable is not defined',
      );
    }

    this.storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT_ID,
      credentials: {
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
      },
    });

    const bucketName: string | undefined = process.env.GCLOUD_BUCKET;
    if (!bucketName) {
      throw new Error('GCLOUD_BUCKET environment variable is not defined');
    }
    this.bucket = this.storage.bucket(bucketName);
  }

  async updateUserProfile(updateUserDto: UserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { AccountId: updateUserDto.AccountId },
    });
    const user2 = await this.userRepository.findOne({
      where: { Email: updateUserDto.Email },
    });
    if(user.AccountId != user2.AccountId) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    console.log('DTO:', updateUserDto);

    if (!user) {
      throw new NotFoundException(
        `User with ID ${updateUserDto.AccountId} not found`,
      );
    }

    // Selectively update properties
    if (updateUserDto.Email !== undefined) 
      user.Email = updateUserDto.Email;
    if (updateUserDto.Username !== undefined)
      user.Username = updateUserDto.Username;
    if (updateUserDto.PhoneNumber !== undefined)
      user.PhoneNumber = updateUserDto.PhoneNumber;
    if (updateUserDto.Sex !== undefined) 
      user.Sex = updateUserDto.Sex;
    if (updateUserDto.DoB !== undefined) 
      user.DoB = updateUserDto.DoB;

    return this.userRepository.save(user); // ✅ Save changes
  }

  async updateAvatar(id: number, file: Buffer): Promise<any> {
    const blob = this.bucket.file(
      `user_avatar/${uuidv4()}_${id}_avt`,
    );
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: 'image/jpeg' , // Or dynamically detect using `file.mimetype`
      },
    });
    const avt_url = await new Promise((resolve, reject) => {
      blobStream
        .on('finish', async () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
          console.log('Uploaded avatar URL:', publicUrl); // ✅ Log URL
          // console.log(`${this.bucket.name}/////${blob.name}`);
          const user = await this.userRepository.findOne({
            where: { AccountId: id },
          });
          user.Avatar = publicUrl;
          await this.userRepository.save(user);
          resolve(publicUrl);
        })
        .on('error', (err) => {
          reject(new Error(`Unable to upload image: ${err.message}`));
        })
        .end(file);
    });
    return avt_url;
  }

  async getUserProfile(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { AccountId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

}
