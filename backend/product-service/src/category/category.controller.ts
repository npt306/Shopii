import { Controller, Get } from '@nestjs/common';
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
}