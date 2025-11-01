import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../models';
import DatabaseService from '../database/DatabaseService';

export class CategoryRepository {
  private db = DatabaseService.getDatabase();

  async getAll(): Promise<Category[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM categories ORDER BY name ASC'
      );
      return result.map(this.mapToCategory);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Category | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return result ? this.mapToCategory(result) : null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async create(category: CreateCategoryDTO): Promise<number> {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [category.name, category.color, category.icon]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async update(category: UpdateCategoryDTO): Promise<void> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (category.name !== undefined) {
        updates.push('name = ?');
        values.push(category.name);
      }
      if (category.color !== undefined) {
        updates.push('color = ?');
        values.push(category.color);
      }
      if (category.icon !== undefined) {
        updates.push('icon = ?');
        values.push(category.icon);
      }

      if (updates.length === 0) return;

      values.push(category.id);
      await this.db.runAsync(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getExpenseCount(categoryId: number): Promise<number> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?',
        [categoryId]
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting expense count:', error);
      throw error;
    }
  }

  private mapToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      createdAt: row.created_at,
    };
  }
}
