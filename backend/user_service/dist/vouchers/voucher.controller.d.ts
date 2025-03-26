import { VoucherService } from './voucher.service';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
export declare class VoucherController {
    private readonly vouchersService;
    constructor(vouchersService: VoucherService);
    getAllVouchers(userId: number): Promise<import("./entities/voucher.entity").Voucher[]>;
    getUserVouchers(userId: number): Promise<import("./entities/voucher.entity").Voucher[]>;
    getVoucherHistory(userId: number): Promise<any[]>;
    addVoucherToUser(createUserVoucherDto: CreateUserVoucherDto): Promise<boolean>;
}
