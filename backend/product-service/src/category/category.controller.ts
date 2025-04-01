import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Categories } from './entities/category.entity';

interface CategoryWithChildren extends Categories {
    children?: CategoryWithChildren[];
}

@Controller('categories') // Changed to match frontend API_BASE_URL
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('tree') // Added 'tree' to match frontend getCategoryTree() URL
    async getCategoryTree(): Promise<CategoryWithChildren[]> {
        return this.categoryService.getCategoryTree();
    }

    @Get('names')
    async getCategoryNames(): Promise<string[]> {
        return this.categoryService.getCategoryNames();
    }

    @Get('name/:name')
    async getCategoryByName(@Param('name') name: string): Promise<Categories> {
        return this.categoryService.getCategoryByName(name);
    }

    @Get(':id')
    async getCategoryById(@Param('id') id: number): Promise<Categories> {
        return this.categoryService.getCategoryById(id);
    }

    @Post()
    async createCategory(@Body() categoryData: Partial<Categories>): Promise<Categories> {
        return this.categoryService.createCategory(categoryData);
    }

    @Patch(':id') // Changed from Put to Patch to match frontend
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

    // This endpoint can either be changed or we need to update the frontend
    @Patch(':id/toggle')
    async toggleCategoryStatus(
        @Param('id') id: number,
        @Body() body: { isActive: boolean }
    ): Promise<Categories> {
        return this.categoryService.toggleCategoryStatus(id, body.isActive);
    }
}