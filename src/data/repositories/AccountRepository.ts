import { Account, CreateAccountDTO, UpdateAccountDTO } from '../models';
import DatabaseService from '../database/DatabaseService';

export class AccountRepository {
  private db = DatabaseService.getDatabase();

  async getAll(): Promise<Account[]> {
    try {
      const result = await this.db.getAllAsync<any>(
        'SELECT * FROM accounts ORDER BY name ASC'
      );
      return result.map(this.mapToAccount);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Account | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM accounts WHERE id = ?',
        [id]
      );
      return result ? this.mapToAccount(result) : null;
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  async create(account: CreateAccountDTO): Promise<number> {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO accounts (name, balance, currency) VALUES (?, ?, ?)',
        [account.name, account.balance, account.currency]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async update(account: UpdateAccountDTO): Promise<void> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (account.name !== undefined) {
        updates.push('name = ?');
        values.push(account.name);
      }
      if (account.balance !== undefined) {
        updates.push('balance = ?');
        values.push(account.balance);
      }
      if (account.currency !== undefined) {
        updates.push('currency = ?');
        values.push(account.currency);
      }

      if (updates.length === 0) return;

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(account.id);

      await this.db.runAsync(
        `UPDATE accounts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async updateBalance(id: number, amount: number, isIncome: boolean): Promise<void> {
    try {
      const account = await this.getById(id);
      if (!account) throw new Error('Account not found');

      const newBalance = isIncome 
        ? account.balance + amount 
        : account.balance - amount;

      await this.update({ id, balance: newBalance });
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }

  private mapToAccount(row: any): Account {
    return {
      id: row.id,
      name: row.name,
      balance: row.balance,
      currency: row.currency,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
