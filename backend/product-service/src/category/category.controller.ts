import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Categories } from './entities/category.entity';


interface CategoryWithChildren extends Categories {
    children?: CategoryWithChildren[];
}

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    async getAllCategories(): Promise<CategoryWithChildren[]> {
        return this.categoryService.getCategoryTree();
    }

    @Get('names')
    async getCategoryNames(): Promise<string[]> {
        return this.categoryService.getCategoryNames();
    }

    @Get(':id')
    async getCategoryById(@Param('id') id: number): Promise<Categories> {
        return this.categoryService.getCategoryById(id);
    }

    @Post()
    async createCategory(@Body() categoryData: Partial<Categories>): Promise<Categories> {
        return this.categoryService.createCategory(categoryData);
    }

    @Put(':id')
    async updateCategory(
        @Param('id') id: number,
        @Body() categoryData: Partial<Categories>
    ): Promise<Categories> {
        return this.categoryService.updateCategory(id, categoryData);
    }

    @Delete(':id')
    async deleteCategory(@Param('id') id: number): Promise<void> {
        return this.categoryService.deleteCategory(id);
    }

    @Patch(':id/toggle')
    async toggleCategoryStatus(
        @Param('id') id: number,
        @Body() body: { isActive: boolean }
    ): Promise<Categories> {
        return this.categoryService.toggleCategoryStatus(id, body.isActive);
    }
}