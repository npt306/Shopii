import { Controller, Post, Body, Get, UseGuards, Req, Query, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from 'src/DTO/user.dto';
import admin from 'firebase-admin';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/GUARDS/firebase.guard';
import { RolesGuard } from 'src/GUARDS/role.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('register')
    async register(@Body() data: UserDto, @Query('role') role: 'buyer' | 'seller' | 'admin') {
        if (!role || !['buyer', 'seller', 'admin'].includes(role)) {
            throw new BadRequestException('Invalid role. Choose buyer, seller, or admin.');
        }
        return await this.userService.registerUser(data, role);
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