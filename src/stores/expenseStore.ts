import { create } from 'zustand';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '../data/models';
import { ExpenseRepository } from '../data/repositories/ExpenseRepository';
import { AccountRepository } from '../data/repositories/AccountRepository';
import { useAccountStore } from './accountStore';

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: CreateExpenseDTO) => Promise<void>;
  updateExpense: (expense: UpdateExpenseDTO) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  getExpensesByDateRange: (startDate: string, endDate: string) => Promise<void>;
  searchExpenses: (searchTerm: string) => Promise<void>;
}

// Lazy-load repositories to avoid database initialization issues
let expenseRepository: ExpenseRepository | null = null;
let accountRepository: AccountRepository | null = null;

const getExpenseRepository = () => {
  if (!expenseRepository) expenseRepository = new ExpenseRepository();
  return expenseRepository;
};

const getAccountRepository = () => {
  if (!accountRepository) accountRepository = new AccountRepository();
  return accountRepository;
};

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await getExpenseRepository().getAll();
      set({ expenses, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addExpense: async (expense: CreateExpenseDTO) => {
    set({ loading: true, error: null });
    try {
      const id = await getExpenseRepository().create(expense);
      
      // Update account balance
      await getAccountRepository().updateBalance(
        expense.accountId,
        expense.amount,
        expense.type === 'income'
      );
      
      // Refresh accounts to reflect balance changes
      await useAccountStore.getState().fetchAccounts();
      
      const newExpense = await getExpenseRepository().getById(id);
      if (newExpense) {
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateExpense: async (expense: UpdateExpenseDTO) => {
    set({ loading: true, error: null });
    try {
      // Get the original expense before updating
      const originalExpense = await getExpenseRepository().getById(expense.id);
      if (!originalExpense) {
        throw new Error('Original expense not found');
      }

      // Update the expense record
      await getExpenseRepository().update(expense);
      const updatedExpense = await getExpenseRepository().getById(expense.id);
      if (!updatedExpense) {
        throw new Error('Updated expense not found');
      }

      // Revert the original transaction
      await getAccountRepository().updateBalance(
        originalExpense.accountId,
        originalExpense.amount,
        originalExpense.type === 'expense' // Add back if it was an expense
      );

      // Apply the new transaction
      await getAccountRepository().updateBalance(
        updatedExpense.accountId,
        updatedExpense.amount,
        updatedExpense.type === 'income' // Subtract if it's not income
      );

      // Refresh accounts to reflect balance changes
      await useAccountStore.getState().fetchAccounts();

      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === expense.id ? updatedExpense : e
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteExpense: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const expense = await getExpenseRepository().getById(id);
      if (expense) {
        // Reverse the account balance change
        await getAccountRepository().updateBalance(
          expense.accountId,
          expense.amount,
          expense.type === 'expense' // Reverse the operation
        );
      }
      
      await getExpenseRepository().delete(id);
      
      // Refresh accounts to reflect balance changes
      await useAccountStore.getState().fetchAccounts();
      
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getExpensesByDateRange: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const expenses = await getExpenseRepository().getByDateRange(startDate, endDate);
      set({ expenses, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  searchExpenses: async (searchTerm: string) => {
    set({ loading: true, error: null });
    try {
      const expenses = await getExpenseRepository().searchByNote(searchTerm);
      set({ expenses, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
