import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { CategoryRepository } from '../data/repositories/CategoryRepository';
import { AccountRepository } from '../data/repositories/AccountRepository';
import { ExpenseRepository } from '../data/repositories/ExpenseRepository';
import { DEFAULT_CATEGORIES } from '../constants/data';

export const seedDefaultCategories = async (): Promise<void> => {
  const categoryRepo = new CategoryRepository();
  try {
    const existingCategories = await categoryRepo.getAll();
    if (existingCategories.length === 0) {
      for (const category of DEFAULT_CATEGORIES) {
        await categoryRepo.create(category);
      }
      console.log('Default categories seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
};

export const seedDatabase = async (): Promise<void> => {
  const categoryRepo = new CategoryRepository();
  const accountRepo = new AccountRepository();
  const expenseRepo = new ExpenseRepository();

  try {
    // Check if data already exists
    const existingCategories = await categoryRepo.getAll();
    if (existingCategories.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed categories
    const categoryIds: number[] = [];
    for (const category of DEFAULT_CATEGORIES) {
      const id = await categoryRepo.create(category);
      categoryIds.push(id);
    }

    // Seed default account
    const accountId = await accountRepo.create({
      name: 'Main Account',
      balance: 50000,
      currency: 'INR',
    });

    // Seed sample expenses for the current month
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const sampleExpenses = [
      // Income
      { amount: 50000, categoryId: categoryIds[8], note: 'Monthly Salary', type: 'income' as const, daysAgo: 25 },
      
      // Expenses
      { amount: 1500, categoryId: categoryIds[0], note: 'Grocery shopping', type: 'expense' as const, daysAgo: 2 },
      { amount: 250, categoryId: categoryIds[0], note: 'Restaurant dinner', type: 'expense' as const, daysAgo: 3 },
      { amount: 500, categoryId: categoryIds[1], note: 'Fuel', type: 'expense' as const, daysAgo: 5 },
      { amount: 200, categoryId: categoryIds[1], note: 'Uber ride', type: 'expense' as const, daysAgo: 7 },
      { amount: 3000, categoryId: categoryIds[2], note: 'New shoes', type: 'expense' as const, daysAgo: 8 },
      { amount: 800, categoryId: categoryIds[3], note: 'Movie tickets', type: 'expense' as const, daysAgo: 10 },
      { amount: 2500, categoryId: categoryIds[4], note: 'Electricity bill', type: 'expense' as const, daysAgo: 12 },
      { amount: 1500, categoryId: categoryIds[4], note: 'Internet bill', type: 'expense' as const, daysAgo: 12 },
      { amount: 1000, categoryId: categoryIds[5], note: 'Medicine', type: 'expense' as const, daysAgo: 15 },
      { amount: 5000, categoryId: categoryIds[6], note: 'Online course', type: 'expense' as const, daysAgo: 18 },
      { amount: 12000, categoryId: categoryIds[7], note: 'Flight tickets', type: 'expense' as const, daysAgo: 20 },
      { amount: 350, categoryId: categoryIds[0], note: 'Coffee and snacks', type: 'expense' as const, daysAgo: 1 },
      { amount: 1200, categoryId: categoryIds[2], note: 'Books', type: 'expense' as const, daysAgo: 4 },
      { amount: 450, categoryId: categoryIds[3], note: 'Spotify subscription', type: 'expense' as const, daysAgo: 6 },
    ];

    for (const expense of sampleExpenses) {
      const date = format(subDays(today, expense.daysAgo), 'yyyy-MM-dd');
      await expenseRepo.create({
        amount: expense.amount,
        categoryId: expense.categoryId,
        accountId: accountId,
        note: expense.note,
        date: date,
        type: expense.type,
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
