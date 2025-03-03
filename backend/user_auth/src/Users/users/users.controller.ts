import { Controller, Post, Body, Get, UseGuards, Req, Query, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/DTO/user.dto';
import admin, { database } from 'firebase-admin';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/GUARDS/firebase.guard';
import { RolesGuard } from 'src/GUARDS/role.guard';
import { MetadataAlreadyExistsError } from 'typeorm';
import axios from 'axios';
import { refreshToken } from 'firebase-admin/app';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('register')
    async register(@Body() data: UserDto, @Query('role') role: 'buyer' | 'seller' | 'admin') {
        console.log('Received Data:', data); // Debug log
        if (!role || !['buyer', 'seller', 'admin'].includes(role)) {
            throw new BadRequestException('Invalid role. Choose buyer, seller, or admin.');
        }
        return await this.userService.registerUser(data, role);
    }

    @Post('login')
    async login(@Body() body: { email: string, password: string }): Promise<any> {
        const { email, password } = body;
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if(!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        try {
            const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
            const response = await axios.post(url, {
                email,
                password,
                returnSecureToken: true
            })

            // Retrieve firebase user record to extract role
            const userRecord = await admin.auth().getUser(response.data.localId);
            return {
                idToken: response.data.idToken,
                refreshToken: response.data.refreshToken,
                role: userRecord.customClaims?.role || null,
                firebaseUser: userRecord,
            };
        }
        catch (error){
            throw new UnauthorizedException('Invalid email or password');
        }
    }

    @Post('login/phone/send-otp')
    async sendOtp(@Body() body: { phone_number: string; recaptchaToken: string }): Promise<any> {
        // Check if we should bypass reCAPTCHA (for development/testing)
        // if (process.env.NODE_ENV === 'development' || process.env.SKIP_RECAPTCHA === 'true') {
        //     // Return a dummy session info for testing purposes
        //     return { sessionInfo: 'dummy-session-info' };
        // }

        // Check if we should bypass reCAPTCHA (for development/testing)
        if (process.env.NODE_ENV === 'development' || process.env.SKIP_RECAPTCHA === 'true') {
            // Return a dummy session info for testing purposes
            return { sessionInfo: 'dummy-session-info' };
        }
        
        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if(!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        try {
            const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
            const response = await axios.post(url, {
                phone_number: body.phone_number,
                recaptchaToken: body.recaptchaToken,
            });

            // Returns SessionInfo that can be used to verify OTP
            return { SessionInfo: response.data.SessionInfo };
        }
        catch (error){
            throw new UnauthorizedException('Failed to send verification code');
        }
    }

    @Post('login/phone/verify-otp')
    async verifyOtp(@Body() body: { sessionInfo: string; code: string }): Promise<any> {
        // Bypass verification if in development/testing mode
        // if (process.env.NODE_ENV === 'development' || process.env.SKIP_RECAPTCHA === 'true') {
        //     // Return dummy tokens and a dummy user record with a role
        //     return {
        //     idToken: 'dummy-id-token',
        //     refreshToken: 'dummy-refresh-token',
        //     role: 'buyer',  // or whichever role you want to simulate
        //     firebaseUser: { uid: 'dummy-uid', customClaims: { role: 'buyer' } },
        //     };
        // }

        const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
        if(!FIREBASE_API_KEY) {
            throw new BadRequestException('Firebase API key not found');
        }

        try {
            const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
            const response = await axios.post(url, {
                sessionInfo: body.sessionInfo,
                code: body.code,
            });
            
            const idToken = response.data.idToken;

            const userRecord = await admin.auth().getUser(response.data.localId);

            return { 
                idToken,
                refreshToken: response.data.refreshToken,
                role: userRecord.customClaims?.role || null,
                firebaseUser: userRecord,    
            };
        }
        catch (error){
            throw new UnauthorizedException('Invalid verification code or session info');
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
}