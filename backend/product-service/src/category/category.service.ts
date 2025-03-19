import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/category.entity';

interface CategoryWithChildren extends Categories {
    children?: CategoryWithChildren[];
}

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Categories)
        private readonly categoriesRepository: Repository<Categories>,
    ) { }

    async getCategoryTree(): Promise<CategoryWithChildren[]> {
        const categories = await this.categoriesRepository.find();
        const categoryMap = new Map<number, CategoryWithChildren>();

        // Tạo một bản đồ từ CategoryID đến danh mục
        categories.forEach(category => {
            categoryMap.set(category.CategoryID, { ...category, children: [] });
        });

        // Xây dựng cây danh mục
        const buildTree = (parentId: number | null): CategoryWithChildren[] => {
            return categories
                .filter(category => category.ParentID === parentId)
                .map(category => {
                    const categoryWithChildren = categoryMap.get(category.CategoryID)!;
                    categoryWithChildren.children = buildTree(category.CategoryID);
                    return categoryWithChildren;
                });
        };

        return buildTree(null);
    }

}