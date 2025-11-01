import * as Sharing from 'expo-sharing';
import { Expense } from '../data/models';
import { format } from 'date-fns';
import { Platform, Alert } from 'react-native';

export const exportToCSV = async (expenses: Expense[], categories: any[], accounts: any[]): Promise<void> => {
  try {
    // Create CSV header
    const header = 'Date,Type,Amount,Category,Account,Note\n';
    
    // Create CSV rows
    const rows = expenses.map((expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      const account = accounts.find((a) => a.id === expense.accountId);
      
      return `${expense.date},${expense.type},${expense.amount},"${category?.name || 'Unknown'}","${account?.name || 'Unknown'}","${expense.note.replace(/"/g, '""')}"`;
    }).join('\n');
    
    const csvContent = header + rows;
    const fileName = `expenses_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
    
    // For now, we'll log the CSV content and show it can be copied
    // In production, you would implement platform-specific file saving
    console.log('CSV Export:', csvContent);
    
    Alert.alert(
      'Export Ready',
      `Your expense data has been prepared for export.\n\nTotal rows: ${expenses.length}\nFilename: ${fileName}\n\nThe CSV data is logged to the console.`,
      [{ text: 'OK' }]
    );
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    Alert.alert('Error', 'Failed to export data');
    throw error;
  }
};

export const formatCurrency = (amount: number, currencySymbol: string): string => {
  return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currencies: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
  };
  return currencies[currencyCode] || currencyCode;
};
