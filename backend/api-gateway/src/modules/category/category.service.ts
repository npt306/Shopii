import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CategoryService {
    constructor(private readonly httpService: HttpService) { }

    async getCategoryTree(): Promise<any> {
        const response = await firstValueFrom(this.httpService.get('/categories/tree'));
        return response.data;
    }

    async getCategoryNames(): Promise<any> {
        const response = await firstValueFrom(this.httpService.get('/categories/names'));
        return response.data;
    }

    async getCategoryById(id: number): Promise<any> {
        const response = await firstValueFrom(this.httpService.get(`/categories/${id}`));
        return response.data;
    }

    async getCategoryByName(name: string): Promise<any> {
        const response = await firstValueFrom(this.httpService.get(`/categories/name/${name}`));
        return response.data;
    }

    async createCategory(categoryData: any): Promise<any> {
        const response = await firstValueFrom(this.httpService.post('/categories', categoryData));
        return response.data;
    }

    async updateCategory(id: number, categoryData: any): Promise<any> {
        const response = await firstValueFrom(this.httpService.patch(`/categories/${id}`, categoryData));
        return response.data;
    }

    async deleteCategory(id: number): Promise<any> {
        try {
            const response = await firstValueFrom(this.httpService.delete(`/categories/${id}`));
            return response.data;
        } catch (error: any) {
            console.error("Error deleting category via gateway:", error.response?.data || error.message);
            throw error;
        }
    }

    async toggleCategoryStatus(id: number, isActive: boolean): Promise<any> {
        const response = await firstValueFrom(
            this.httpService.patch(`/categories/${id}/toggle`, { isActive })
        );
        return response.data;
    }
}