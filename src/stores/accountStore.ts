import { create } from 'zustand';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '../data/models';
import { AccountRepository } from '../data/repositories/AccountRepository';

interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  addAccount: (account: CreateAccountDTO) => Promise<void>;
  updateAccount: (account: UpdateAccountDTO) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
}

// Lazy-load repository to avoid database initialization issues
let accountRepository: AccountRepository | null = null;

const getAccountRepository = () => {
  if (!accountRepository) accountRepository = new AccountRepository();
  return accountRepository;
};

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await getAccountRepository().getAll();
      set({ accounts, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addAccount: async (account: CreateAccountDTO) => {
    set({ loading: true, error: null });
    try {
      const id = await getAccountRepository().create(account);
      const newAccount = await getAccountRepository().getById(id);
      
      if (newAccount) {
        set((state) => ({
          accounts: [...state.accounts, newAccount],
          loading: false,
        }));
      }
    } catch (error) {
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
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
