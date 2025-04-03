import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports: [
        HttpModule.register({
            baseURL: process.env.PRODUCT_SERVICE_URL,
        }),
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule { }