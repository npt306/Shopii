import { Injectable, BadGatewayException } from '@nestjs/common';
import admin from 'src/FIREBASE/firebase.admin';
import { UserDto } from 'src/DTO/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/DB TABLE/user.entity';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async registerUser(data: UserDto, roles: ('buyer' | 'seller' | 'admin')[]) {
    try {
      // Validate that at least one role is provided
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        throw new BadGatewayException('At least one role must be provided.');
      }
  
      // Optional: Validate that each role is one of the allowed values
      const allowedRoles = ['buyer', 'seller', 'admin'];
      const invalidRoles = roles.filter(role => !allowedRoles.includes(role));
      if (invalidRoles.length) {
        throw new BadGatewayException(`Invalid role(s) provided: ${invalidRoles.join(', ')}`);
      }
  
      // Build payload for Firebase createUser dynamically:
      const createUserPayload: any = {
        email: data.email,
        password: data.password,
      };
  
      if (data.phoneNumber) {
        createUserPayload.phoneNumber = data.phoneNumber;
      }
  
      // Create the user in Firebase
      const userRecord = await admin.auth().createUser(createUserPayload);
  
      // Set custom claims for role-based access control using an array of roles
      await admin.auth().setCustomUserClaims(userRecord.uid, { roles });
  
      // Generate email verification link using Firebase Admin SDK
      const actionCodeSettings = {
        // Replace with the URL you want users to be redirected to after verification
        url: 'http://localhost/verify?email=' + data.email,
        handleCodeInApp: true,
      };
  
      const verificationLink = await admin
        .auth()
        .generateEmailVerificationLink(data.email, actionCodeSettings);
  
      console.log('Email verification link:', verificationLink);
  
      // Create and save user data in PostgreSQL
      const user = this.userRepository.create({
        email: data.email,
        username: data.username,
        date_of_birth: data.date_of_birth,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatar: data.avatar,
        status: data.status,
        sex: data.sex,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const savedUser = await this.userRepository.save(user);
  
      return {
        firebase: userRecord,
        postgres: savedUser,
        message: 'User registered successfully! Please check your email to verify your account.',
        // For debugging; don't return the link in production
        verificationLink,
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

  async refreshIdToken(refreshToken: string): Promise<any> {
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
    const url = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;

    // Create a URL-encoded form body
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    // Make the POST request
    const response = await axios.post(url, params);

    // The response will include a new idToken, new refreshToken, and other info
    return response.data;
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: Number(id) } });
      if (!user) {
        throw new BadGatewayException('User not found');
      }
      return user;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async updateUserStatus(id: string, status: 'normal' | 'banned'): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: Number(id) } });
      if (!user) {
        throw new BadGatewayException('User not found');
      }

      user.status = status;
      user.updatedAt = new Date();

      return await this.userRepository.save(user);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async fetchUser(role: 'buyer' | 'seller' | 'admin'): Promise<Partial<User>[]> {
    try {
      const users = await this.userRepository.find();

      if (role === 'admin') {
        return users; // Return all user details for admin
      }

      // Return limited user details for buyer or seller
      return users.map(user => ({
        username: user.username,
        email: user.email,
        address: user.address,
        phoneNumber: user.phoneNumber,
      }));
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async updateUser(id: string, updateData: Partial<UserDto>): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: Number(id) } });
      if (!user) {
        throw new BadGatewayException('User not found');
      }

      // Update user fields with provided data
      Object.assign(user, updateData);
      user.updatedAt = new Date();

      return await this.userRepository.save(user);
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  // async findByFirebaseUid(uid: string): Promise<User> {
  //   try {
  //     const user = await this.userRepository.findOne({ where: { firebaseUid: uid } });
  //     if (!user) {
  //       throw new BadGatewayException('User not found');
  //     }
  //     return user;
  //   } catch (error) {
  //     throw new BadGatewayException(error.message);
  //   }
  // }

  // async createUser(uid: string){
  //   try {
  //     const data = await admin.auth().getUser(uid);
  //     const user = this.userRepository.create({
  //       email: data.email,
  //       username: data.username,
  //       date_of_birth: data.date_of_birth,
  //       phoneNumber: data.phoneNumber,
  //       address: data.address,
  //       avatar: data.avatar,
  //       status: data.status,
  //       sex: data.sex,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     });
  //     return await this.userRepository.save(user);
  //   } catch (error) {
  //     throw new BadGatewayException(error.message);
  //   }
  // }
}
