// Define types for the API responses and requests
export interface LoginResponse {
    standardAccessToken: string;
    rptAccessToken: string;
    refresh_token: string;
    profile: {
        accountId: string;
        email: string;
        username: string;
        avatar: string;
        dateOfBirth: string;
        phoneNumber: string;
        sex: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        isSeller: boolean;
        sellerInfo: any;
        userInfo: any;
    };
}

export interface RegisterResponse {
    success: boolean;
    userId: string;
}

export interface RefreshTokenResponse {
    standardAccessToken: string;
    rptAccessToken: string;
    refresh_token: string;
}

export interface UserDto {
    username: string;
    password: string;
    email?: string;
}

export interface FormData {
    username: string;
    password: string;
    phone: string;
}