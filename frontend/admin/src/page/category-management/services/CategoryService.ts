interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID: number | null;
    isActive: boolean;
    children?: Category[];
}

const API_BASE_URL = '/api'; // Change this to your actual API URL

export const CategoryService = {
    async getCategoryTree(): Promise<Category[]> {
        const response = await fetch(`${API_BASE_URL}/categories/tree`);

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        return response.json();
    },

    async getCategoryById(id: number): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch category with ID ${id}`);
        }

        return response.json();
    },

    async createCategory(categoryData: Partial<Category>): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create category');
        }

        return response.json();
    },

    async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to update category with ID ${id}`);
        }

        return response.json();
    },

    async deleteCategory(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete category with ID ${id}`);
        }
    },

    async toggleCategoryStatus(id: number, isActive: boolean): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isActive }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to toggle category status`);
        }

        return response.json();
    },

    async getCategoryNames(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/categories/names`);

        if (!response.ok) {
            throw new Error('Failed to fetch category names');
        }

        return response.json();
    },

    async getCategoryByName(name: string): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/categories/name/${name}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch category with name ${name}`);
        }

        return response.json();
    },
};