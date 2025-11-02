import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '../models';
import DatabaseService from '../database/DatabaseService';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export class ExpenseRepository {
  private get db() {
    return DatabaseService.getDatabase();
  }

  async getAll(): Promise<Expense[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM expenses ORDER BY date DESC, created_at DESC'
      );
      return result.map(this.mapToExpense);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Expense | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM expenses WHERE id = ?',
        [id]
      );
      return result ? this.mapToExpense(result) : null;
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  async create(expense: CreateExpenseDTO): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO expenses (amount, category_id, account_id, note, date, type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          expense.amount,
          expense.categoryId,
          expense.accountId,
          expense.note,
          expense.date,
          expense.type,
        ]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async update(expense: UpdateExpenseDTO): Promise<void> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (expense.amount !== undefined) {
        updates.push('amount = ?');
        values.push(expense.amount);
      }
      if (expense.categoryId !== undefined) {
        updates.push('category_id = ?');
        values.push(expense.categoryId);
      }
      if (expense.accountId !== undefined) {
        updates.push('account_id = ?');
        values.push(expense.accountId);
      }
      if (expense.note !== undefined) {
        updates.push('note = ?');
        values.push(expense.note);
      }
      if (expense.date !== undefined) {
        updates.push('date = ?');
        values.push(expense.date);
      }
      if (expense.type !== undefined) {
        updates.push('type = ?');
        values.push(expense.type);
      }

      if (updates.length === 0) return;

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(expense.id);

      await this.db.runAsync(
        `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      );
      return result.map(this.mapToExpense);
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }

  async getByCategory(categoryId: number): Promise<Expense[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC',
        [categoryId]
      );
      return result.map(this.mapToExpense);
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      throw error;
    }
  }

  async getByAccount(accountId: number): Promise<Expense[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM expenses WHERE account_id = ? ORDER BY date DESC',
        [accountId]
      );
      return result.map(this.mapToExpense);
    } catch (error) {
      console.error('Error fetching expenses by account:', error);
      throw error;
    }
  }

  async getCurrentMonthExpenses(): Promise<Expense[]> {
    const now = new Date();
    const start = format(startOfMonth(now), 'yyyy-MM-dd');
    const end = format(endOfMonth(now), 'yyyy-MM-dd');
    return this.getByDateRange(start, end);
  }

  async getTotalByTypeAndDateRange(
    type: 'expense' | 'income',
    startDate: string,
    endDate: string,
    accountId?: number
  ): Promise<number> {
    try {
      let query = 'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE type = ? AND date BETWEEN ? AND ?';
      const params: any[] = [type, startDate, endDate];

      if (accountId) {
        query += ' AND account_id = ?';
        params.push(accountId);
      }

      const result = await this.db.getFirstAsync<{ total: number }>(query, params);
      return result?.total || 0;
    } catch (error) {
      console.error('Error calculating total:', error);
      throw error;
    }
  }

  async getCategoryTotals(
    startDate: string,
    endDate: string,
    accountId?: number
    ): Promise<Array<{ categoryId: number; total: number }>> {
    try {
      let query = `
        SELECT category_id as categoryId, SUM(amount) as total 
        FROM expenses 
        WHERE type = 'expense' AND date BETWEEN ? AND ?`;
      const params: any[] = [startDate, endDate];

      if (accountId) {
        query += ' AND account_id = ?';
        params.push(accountId);
      }

      query += ' GROUP BY category_id ORDER BY total DESC';
      
      const result = await this.db.getAllAsync<any>(query, params);
      return result;
    } catch (error) {
      console.error('Error getting category totals:', error);
      throw error;
    }
  }

  async searchByNote(searchTerm: string): Promise<Expense[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM expenses WHERE note LIKE ? ORDER BY date DESC',
        [`%${searchTerm}%`]
      );
      return result.map(this.mapToExpense);
    } catch (error) {
      console.error('Error searching expenses:', error);
      throw error;
    }
  }

  private mapToExpense(row: any): Expense {
    return {
      id: row.id,
      amount: row.amount,
      categoryId: row.category_id,
      accountId: row.account_id,
      note: row.note || '',
      date: row.date,
      type: row.type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
