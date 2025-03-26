"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const voucher_entity_1 = require("./entities/voucher.entity");
const user_voucher_entity_1 = require("./entities/user-voucher.entity");
const voucher_history_entity_1 = require("./entities/voucher-history.entity");
const typeorm_3 = require("typeorm");
let VoucherService = class VoucherService {
    constructor(voucherRepository, voucherHistoryRepository, userVoucherRepository) {
        this.voucherRepository = voucherRepository;
        this.voucherHistoryRepository = voucherHistoryRepository;
        this.userVoucherRepository = userVoucherRepository;
    }
    async getActiveVouchers(userId) {
        const currentDate = new Date();
        const userVouchers = await this.userVoucherRepository.find({
            where: { OwnerId: userId },
        });
        const userVoucherIds = userVouchers.map(uv => uv.VoucherId);
        const vouchers = await this.voucherRepository.find({
            where: {
                id: (0, typeorm_3.Not)((0, typeorm_2.In)(userVoucherIds)),
                ends_at: (0, typeorm_3.MoreThan)(currentDate),
            },
        });
        return vouchers;
    }
    async getUserVouchers(userId) {
        const userVouchers = await this.userVoucherRepository.find({
            where: { OwnerId: userId },
        });
        const userVoucherIds = userVouchers.map(uv => uv.VoucherId);
        const vouchers = await this.voucherRepository.find({
            where: { id: (0, typeorm_2.In)(userVoucherIds) },
        });
        return vouchers.map(voucher => {
            const userVoucher = userVouchers.find(uv => uv.VoucherId === voucher.id);
            return {
                ...voucher,
                using_time_left: userVoucher?.UsingTimeLeft ?? 0,
            };
        });
    }
    async getUserVoucherHistory(userId) {
        const histories = await this.voucherHistoryRepository.find({
            where: { UserID: userId },
        });
        const voucherIds = histories.map(history => history.VoucherID);
        const vouchers = await this.voucherRepository.find({
            where: {
                id: (0, typeorm_2.In)(voucherIds),
            },
        });
        return histories.map(history => ({
            ...history,
            voucher: vouchers.find(v => v.id === history.VoucherID),
        }));
    }
    async userClaimVoucher(dto) {
        console.log("OUTTTTTTTT", dto);
        let voucher;
        if (dto.VoucherCode) {
            voucher = await this.voucherRepository.findOne({
                where: { code: dto.VoucherCode },
            });
        }
        else {
            voucher = await this.voucherRepository.findOne({
                where: { id: dto.VoucherId },
            });
        }
        console.log("Found Voucher:", voucher);
        if (voucher) {
            const exist_voucher = await this.userVoucherRepository.findOne({
                where: { VoucherId: voucher.id },
            });
            if (exist_voucher) {
                return false;
            }
            const newVoucher = await this.userVoucherRepository.create({
                VoucherId: voucher.id,
                OwnerId: dto.OwnerId,
                ExpDate: voucher.ends_at,
                UsingTimeLeft: voucher.per_customer_limit,
            });
            await this.userVoucherRepository.save(newVoucher);
            return true;
        }
        return false;
    }
};
exports.VoucherService = VoucherService;
exports.VoucherService = VoucherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(voucher_entity_1.Voucher)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_history_entity_1.VoucherHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(user_voucher_entity_1.UserVoucher)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VoucherService);
//# sourceMappingURL=voucher.service.js.map