import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
export declare class UserController {
    private readonly usersService;
    constructor(usersService: UserService);
    updateProfile(getUserDto: UserDto): Promise<import("./entities/user.entity").User>;
    updateAvatar(id: number, file: Express.Multer.File): Promise<any>;
    getProfile(id: number): Promise<import("./entities/user.entity").User>;
    getInfo(email: string): Promise<import("./entities/user.entity").User>;
}
