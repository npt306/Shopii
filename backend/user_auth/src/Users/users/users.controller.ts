import { Controller, Post, Body, Get, UseGuards, Req, Query, SetMetadata, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/DTO/user.dto';
import admin, { database } from 'firebase-admin';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/GUARDS/firebase.guard';
import { RolesGuard } from 'src/GUARDS/role.guard';
import axios from 'axios';
import { GoogleRegisterDto } from 'src/DTO/googleRegister.dto';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

@Controller('Users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post('register')
    async register(@Body() data: UserDto, @Query('roles') rolesParam: string) {
        console.log('Received Data:', data); // Debug log

        // Ensure the roles query parameter is provided
        if (!rolesParam) {
            throw new BadRequestException('At least one role must be provided in the roles query parameter.');
        }

        // Parse the comma-separated roles string into an array and trim any extra spaces
        const roles = rolesParam.split(',').map(role => role.trim());

        // Validate each role against allowed roles
        const allowedRoles = ['buyer', 'seller', 'admin'];
        const invalidRoles = roles.filter(role => !allowedRoles.includes(role));
        if (invalidRoles.length > 0) {
            throw new BadRequestException(`Invalid role(s): ${invalidRoles.join(', ')}`);
        }

        // Call the service method with the parsed roles array
        return await this.userService.registerUser(data, roles as ('buyer' | 'seller' | 'admin')[]);
    }


    @Post('add_role_seller')
    async add_role_seller(@Body() data: { email: string }): Promise<any> {
        if (!data.email) {
            throw new BadRequestException('Email is required');
        }

        try {
            // Retrieve the user by email
            const userRecord = await admin.auth().getUserByEmail(data.email);

            // Retrieve existing roles from custom claims (if any)
            let existingRoles = userRecord.customClaims?.roles || [];
            // Ensure existingRoles is an array
            if (!Array.isArray(existingRoles)) {
                existingRoles = [existingRoles];
            }

            // Add 'seller' role and remove duplicates
            const updatedRoles = Array.from(new Set([...existingRoles, 'seller']));

            // Update the custom claims with the merged roles
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                ...userRecord.customClaims,
                roles: updatedRoles
            });

            return { message: 'Seller role added successfully', roles: updatedRoles };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    //TODO:
    //Verfiy email -> send email
    //Save data to database -> seller, buyer, .... table

    //if register using gmail -> check if account exist
    //

    @Post('login')
    async login(@Body() body: { email: string, password: string }): Promise<any> {
        const { email, password } = body;
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if (!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        try {
            const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
            const response = await axios.post(url, {
                email,
                password,
                returnSecureToken: true
            });

            // Retrieve firebase user record to extract role
            const userRecord = await admin.auth().getUser(response.data.localId);

            // Check if email is verified
            if (!userRecord.emailVerified) {
                const verificationUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;
                await axios.post(verificationUrl, {
                    requestType: 'VERIFY_EMAIL',
                    idToken: response.data.idToken
                });

                return {
                    message: 'Email not verified. A verification link has been sent to your email address.',
                    email: email
                };
            }

            // Decode the idToken to get the token expire time
            const decodedToken = await admin.auth().verifyIdToken(response.data.idToken);
            const expiresIn = decodedToken.exp * 1000; // Convert to milliseconds

            return {
                idToken: response.data.idToken,
                refreshToken: response.data.refreshToken,
                firebaseUser: userRecord,
                expiresIn
            };
        }
        catch (error) {
            throw new UnauthorizedException('Invalid email or password');
        }
    }

    @Post('refresh-token')
    @UseGuards(FirebaseAuthGuard)
    async refreshToken(@Body() body: { refreshToken: string }): Promise<any> {
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if (!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        try {
            const url = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;
            const response = await axios.post(url, {
                grant_type: 'refresh_token',
                refresh_token: body.refreshToken
            });

            // Decode the idToken to get the token expire time
            const decodedToken = await admin.auth().verifyIdToken(response.data.id_token);
            const expiresIn = decodedToken.exp * 1000; // Convert to milliseconds

            return {
                idToken: response.data.id_token,
                refreshToken: response.data.refresh_token,
                expiresIn
            };
        }
        catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    @Get('verify_email')
    async getVerificationLink(@Query('email') email: string) {
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if (!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        if (!email) {
            throw new BadRequestException('Email query parameter is required');
        }

        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log(userRecord);

            if (userRecord.emailVerified) {
                return { message: 'Email is already verified' };
            }

            const actionCodeSettings = {
                url: 'http://localhost/verify?email=' + email,
                handleCodeInApp: true,
            };
            const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
            return {
                message: 'Verification link has been generated. Please check your email.',
                link: verificationLink,
            };
        } catch (error) {
            console.error('Error sending verification email:', error.response?.data || error.message);
            throw new NotFoundException('User not found');
        }
    }

    @Get('profile')
    @UseGuards(FirebaseAuthGuard)
    async getProfile(@Req() req) {
        const uid = req.user.uid;
        const userRecord = await admin.auth().getUser(uid);
        return userRecord;
    }

    @Get('search_user')
    async searchUser(@Query('email') email: string) {
        if (!email) {
            throw new BadRequestException('Email query parameter is required');
        }
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            return userRecord;
        } catch (error) {
            throw new NotFoundException('User not found');
        }
    }

    @Get('admin-dashboard')
    @SetMetadata('roles', ['admin'])
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    async adminDashboard() {
        return { message: 'Welcome, Admin!' };
    }

    @Get('seller-section')
    @SetMetadata('roles', ['seller', 'admin'])
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    async sellerSection() {
        return { message: 'Welcome, Seller!' };
    }

    @Get('buyer-section')
    @SetMetadata('roles', ['buyer', 'admin'])
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    async buyerSection() {
        return { message: 'Welcome, Buyer!' };
    }

    @Post('ban-user')
    @SetMetadata('roles', ['admin'])
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    async modifyUserStatus(
        @Query('userId') userId: string,
        @Query('action') action: string,
    ) {
        // Validate query parameters
        if (!userId) {
            throw new BadRequestException('The userId query parameter is required.');
        }
        if (!action || !['banned', 'unban'].includes(action.toLowerCase())) {
            throw new BadRequestException("The action query parameter must be either 'banned' or 'unban'.");
        }

        // Retrieve the user from the database
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        console.log(user);

        const newStatus = action.toLowerCase() === 'banned' ? 'banned' : 'normal';

        // Update the user's status in the database
        const updatedUser = await this.userService.updateUserStatus(userId, newStatus);

        return {
            message: `User has been ${newStatus === 'banned' ? 'banned' : 'unbanned'}.`,
            user: updatedUser,
        };
    }

    // Think of this as fetch product for demo
    @Get('fetch-user')
    @SetMetadata('roles', ['buyer', 'seller', 'admin'])
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    async fetchUser(@Req() request: any) {
        const user = request.user;

        let role: 'buyer' | 'seller' | 'admin';
        if (Array.isArray(user.roles)) {
            if (user.roles.includes('admin')) {
                role = 'admin';
            } else if (user.roles.includes('seller')) {
                role = 'seller';
            } else {
                role = 'buyer';
            }
        } else {
            role = user.role || 'buyer';
        }

        return this.userService.fetchUser(role);
    }
}