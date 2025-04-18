import { Controller, Get, Post, Put, Delete, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PermissionsGuard } from 'src/guard/permission.guard';

@Controller('api/categories')
@UseGuards(PermissionsGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('tree')
    async getCategoryTree(): Promise<any> {
        return this.categoryService.getCategoryTree();
    }

    @Get('names')
    async getCategoryNames(): Promise<any> {
        return this.categoryService.getCategoryNames();
    }

    @Get('name/:name')
    async getCategoryByName(@Param('name') name: string): Promise<any> {
        return this.categoryService.getCategoryByName(name);
    }

    @Get(':id')
    async getCategoryById(@Param('id', ParseIntPipe) id: number): Promise<any> {
        return this.categoryService.getCategoryById(id);
    }

    @Post()
    async createCategory(@Body() categoryData: any): Promise<any> {
        return this.categoryService.createCategory(categoryData);
    }

    @Patch(':id')
    async updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() categoryData: any
    ): Promise<any> {
        return this.categoryService.updateCategory(id, categoryData);
    }

    @Delete(':id')
    async deleteCategory(@Param('id', ParseIntPipe) id: number): Promise<any> {
        return this.categoryService.deleteCategory(id);
    }

    @Patch(':id/toggle')
    async toggleCategoryStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { isActive: boolean }
    ): Promise<any> {
        return this.categoryService.toggleCategoryStatus(id, body.isActive);
    }
}