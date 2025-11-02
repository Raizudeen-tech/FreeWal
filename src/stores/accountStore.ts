import { create } from 'zustand';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '../data/models';
import { AccountRepository } from '../data/repositories/AccountRepository';

interface AccountState {
  accounts: Account[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  addAccount: (account: CreateAccountDTO) => Promise<void>;
  updateAccount: (account: UpdateAccountDTO) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  calculateTotalBalance: () => void;
}

// Lazy-load repository to avoid database initialization issues
let accountRepository: AccountRepository | null = null;

const getAccountRepository = () => {
  if (!accountRepository) accountRepository = new AccountRepository();
  return accountRepository;
};

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalBalance: 0,
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await getAccountRepository().getAll();
      set({ accounts, loading: false });
      get().calculateTotalBalance();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addAccount: async (account: CreateAccountDTO) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating account:', account);
      const id = await getAccountRepository().create(account);
      console.log('Account created with ID:', id);
      const newAccount = await getAccountRepository().getById(id);
      
      if (newAccount) {
        set((state) => ({
          accounts: [...state.accounts, newAccount],
          loading: false,
        }));
        get().calculateTotalBalance();
      }
    } catch (error) {
      console.error('Error creating account:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateAccount: async (account: UpdateAccountDTO) => {
    set({ loading: true, error: null });
    try {
      await getAccountRepository().update(account);
      const updatedAccount = await getAccountRepository().getById(account.id);
      
      if (updatedAccount) {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === account.id ? updatedAccount : a
          ),
          loading: false,
        }));
        get().calculateTotalBalance();
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteAccount: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await getAccountRepository().delete(id);
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        loading: false,
      }));
      get().calculateTotalBalance();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  calculateTotalBalance: () => {
    set((state) => ({
      totalBalance: state.accounts.reduce((sum, acc) => sum + acc.balance, 0),
    }));
  },
}));
