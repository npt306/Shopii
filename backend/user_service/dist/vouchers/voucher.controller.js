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
exports.VoucherController = void 0;
const common_1 = require("@nestjs/common");
const voucher_service_1 = require("./voucher.service");
const user_voucher_dto_1 = require("./dto/user-voucher.dto");
let VoucherController = class VoucherController {
    constructor(vouchersService) {
        this.vouchersService = vouchersService;
    }
    getAllVouchers(userId) {
        return this.vouchersService.getActiveVouchers(userId);
    }
    getUserVouchers(userId) {
        return this.vouchersService.getUserVouchers(userId);
    }
    getVoucherHistory(userId) {
        return this.vouchersService.getUserVoucherHistory(userId);
    }
    addVoucherToUser(createUserVoucherDto) {
        return this.vouchersService.userClaimVoucher(createUserVoucherDto);
    }
};
exports.VoucherController = VoucherController;
__decorate([
    (0, common_1.Get)('/all'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getAllVouchers", null);
__decorate([
    (0, common_1.Get)('/user-vouchers'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getUserVouchers", null);
__decorate([
    (0, common_1.Get)('/history/'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getVoucherHistory", null);
__decorate([
    (0, common_1.Post)('/claim'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_voucher_dto_1.CreateUserVoucherDto]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "addVoucherToUser", null);
exports.VoucherController = VoucherController = __decorate([
    (0, common_1.Controller)('vouchers'),
    __metadata("design:paramtypes", [voucher_service_1.VoucherService])
], VoucherController);
//# sourceMappingURL=voucher.controller.js.map