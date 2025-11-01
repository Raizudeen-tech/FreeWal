export interface Expense {
  id: number;
  amount: number;
  categoryId: number;
  accountId: number;
  note: string;
  date: string; // ISO format
  type: 'expense' | 'income';
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  amount: number;
  categoryId: number;
  accountId: number;
  note: string;
  date: string;
  type: 'expense' | 'income';
}

export interface UpdateExpenseDTO {
  id: number;
  amount?: number;
  categoryId?: number;
  accountId?: number;
  note?: string;
  date?: string;
  type?: 'expense' | 'income';
}
