declare namespace Express {
    export interface Request {
        user?: {
            roles?: string[];
            permissions?: any[];
            email: string;
            password: string;
            username: string;
            date_of_birth?: string;
            phoneNumber?: string;
            status?: string;
            address?: string;
            avatar?: string;
            sex?: string;
        };
    }
}