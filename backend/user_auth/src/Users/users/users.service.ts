import { Injectable, BadGatewayException } from '@nestjs/common';
import admin from 'src/FIREBASE/firebase.admin';
import { UserDto } from 'src/DTO/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/DB TABLE/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(data: UserDto, role: 'buyer' | 'seller' | 'admin') {
    try {
      // 1. Create the user in Firebase
      const userRecord = await admin.auth().createUser({
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
      });

      // Set custom claims for role-based access control:
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });

      // 2. Create and save user data in PostgreSQL
      const user = this.userRepository.create({
        email: data.email,
        username: data.username,
        date_of_birth: data.date_of_birth,
        phoneNumber: data.phoneNumber,
        address: data.address,
        sex: data.sex,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedUser = await this.userRepository.save(user);

      return {
        firebase: userRecord,
        postgres: savedUser,
      };
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async getProtectedData(uid: string) {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord; // Returns user details from Firebase
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }
}
