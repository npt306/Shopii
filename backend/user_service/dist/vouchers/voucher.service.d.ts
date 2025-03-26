import { Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
export declare class VoucherService {
    private voucherRepository;
    private voucherHistoryRepository;
    private userVoucherRepository;
    constructor(voucherRepository: Repository<Voucher>, voucherHistoryRepository: Repository<VoucherHistory>, userVoucherRepository: Repository<UserVoucher>);
    getActiveVouchers(userId: number): Promise<Voucher[]>;
    getUserVouchers(userId: number): Promise<Voucher[]>;
    getUserVoucherHistory(userId: number): Promise<any[]>;
    userClaimVoucher(dto: CreateUserVoucherDto): Promise<boolean>;
}
