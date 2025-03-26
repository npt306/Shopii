import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { Storage } from '@google-cloud/storage';
export declare class UserService {
    private userRepository;
    private bucket;
    storage: Storage;
    constructor(userRepository: Repository<User>);
    updateUserProfile(updateUserDto: UserDto): Promise<User>;
    updateAvatar(id: number, file: Express.Multer.File): Promise<any>;
    getUserProfile(id: number): Promise<User>;
    fetchUserInfo(email: string): Promise<User>;
}
