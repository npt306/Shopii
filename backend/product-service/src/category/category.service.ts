import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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

    async getCategoryNames(): Promise<string[]> {
        const categories = await this.categoriesRepository.find();
        return categories.map(category => category.CategoryName);
    }

    async getCategoryById(id: number): Promise<Categories> {
        const category = await this.categoriesRepository.findOne({
            where: { CategoryID: id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async createCategory(categoryData: Partial<Categories>): Promise<Categories> {
        // Check if a category with the same name already exists
        const existingCategory = await this.categoriesRepository.findOne({
            where: { CategoryName: categoryData.CategoryName }
        });

        if (existingCategory) {
            throw new ConflictException('A category with this name already exists');
        }

        const newCategory = this.categoriesRepository.create(categoryData);
        return this.categoriesRepository.save(newCategory);
    }

    async updateCategory(id: number, categoryData: Partial<Categories>): Promise<Categories> {
        const category = await this.getCategoryById(id);

        // Kiểm tra nếu có thay đổi CategoryName
        if (categoryData.CategoryName) {
            const existingCategory = await this.categoriesRepository.findOne({
                where: {
                    CategoryName: categoryData.CategoryName,
                    CategoryID: Not(id)
                }
            });

            if (existingCategory) {
                throw new ConflictException('A category with this name already exists');
            }
        }

        this.categoriesRepository.merge(category, categoryData);
        return this.categoriesRepository.save(category);
    }

    async deleteCategory(id: number): Promise<void> {
        const category = await this.getCategoryById(id);

        // Check if the category has any children before deleting
        const childCategories = await this.categoriesRepository.find({
            where: { ParentID: id }
        });

        if (childCategories.length > 0) {
            throw new ConflictException('Cannot delete a category with child categories');
        }

        await this.categoriesRepository.remove(category);
    }

    async toggleCategoryStatus(id: number, isActive: boolean): Promise<Categories> {
        const category = await this.getCategoryById(id);
        category.isActive = isActive;
        return this.categoriesRepository.save(category);
    }

}