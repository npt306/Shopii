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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherHistory = void 0;
const typeorm_1 = require("typeorm");
let VoucherHistory = class VoucherHistory {
};
exports.VoucherHistory = VoucherHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VoucherHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherID', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], VoucherHistory.prototype, "VoucherID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserID', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], VoucherHistory.prototype, "UserID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UseDate', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], VoucherHistory.prototype, "UseDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CreatedAt' }),
    __metadata("design:type", Date)
], VoucherHistory.prototype, "CreatedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'UpdatedAt' }),
    __metadata("design:type", Date)
], VoucherHistory.prototype, "UpdatedAt", void 0);
exports.VoucherHistory = VoucherHistory = __decorate([
    (0, typeorm_1.Entity)('VoucherHistories')
], VoucherHistory);
//# sourceMappingURL=voucher-history.entity.js.map