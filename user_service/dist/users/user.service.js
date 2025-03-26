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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const uuid_1 = require("uuid");
const storage_1 = require("@google-cloud/storage");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        const privateKey = process.env.GCLOUD_PRIVATE_KEY;
        const clientEmail = process.env.GCLOUD_CLIENT_EMAIL;
        if (!privateKey || !clientEmail) {
            throw new Error('GCLOUD_PRIVATE_KEY or GCLOUD_CLIENT_EMAIL environment variable is not defined');
        }
        this.storage = new storage_1.Storage({
            projectId: process.env.GCLOUD_PROJECT_ID,
            credentials: {
                private_key: privateKey.replace(/\\n/g, '\n'),
                client_email: clientEmail,
            },
        });
        const bucketName = process.env.GCLOUD_BUCKET;
        if (!bucketName) {
            throw new Error('GCLOUD_BUCKET environment variable is not defined');
        }
        this.bucket = this.storage.bucket(bucketName);
    }
    async updateUserProfile(updateUserDto) {
        const user = await this.userRepository.findOne({
            where: { AccountId: updateUserDto.AccountId },
        });
        console.log('DTO:', updateUserDto);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${updateUserDto.AccountId} not found`);
        }
        if (updateUserDto.Email !== undefined)
            user.Email = updateUserDto.Email;
        if (updateUserDto.Username !== undefined)
            user.Username = updateUserDto.Username;
        if (updateUserDto.PhoneNumber !== undefined)
            user.PhoneNumber = updateUserDto.PhoneNumber;
        if (updateUserDto.Sex !== undefined)
            user.Sex = updateUserDto.Sex;
        if (updateUserDto.DoB !== undefined)
            user.DoB = updateUserDto.DoB;
        return this.userRepository.save(user);
    }
    async updateAvatar(id, file) {
        const blob = this.bucket.file(`user_avatar/${(0, uuid_1.v4)()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({ resumable: false });
        const avt_url = await new Promise((resolve, reject) => {
            blobStream
                .on('finish', async () => {
                const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
                console.log('Uploaded avatar URL:', publicUrl);
                const user = await this.userRepository.findOne({
                    where: { AccountId: id },
                });
                user.Avatar = publicUrl;
                await this.userRepository.save(user);
                resolve(publicUrl);
            })
                .on('error', (err) => {
                reject(new Error(`Unable to upload image: ${err.message}`));
            })
                .end(file.buffer);
        });
        return avt_url;
    }
    async getUserProfile(id) {
        const user = await this.userRepository.findOne({
            where: { AccountId: id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async fetchUserInfo(email) {
        const user = await this.userRepository.findOne({
            where: { Email: email },
            select: ["AccountId", "Email", "Username", "Avatar"],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map