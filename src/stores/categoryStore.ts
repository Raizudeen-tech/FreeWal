import { create } from 'zustand';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../data/models';
import { CategoryRepository } from '../data/repositories/CategoryRepository';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: CreateCategoryDTO) => Promise<void>;
  updateCategory: (category: UpdateCategoryDTO) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategoryExpenseCount: (id: number) => Promise<number>;
}

// Lazy-load repository to avoid database initialization issues
let categoryRepository: CategoryRepository | null = null;

const getCategoryRepository = () => {
  if (!categoryRepository) categoryRepository = new CategoryRepository();
  return categoryRepository;
};

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await getCategoryRepository().getAll();
      set({ categories, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addCategory: async (category: CreateCategoryDTO) => {
    set({ loading: true, error: null });
    try {
      const id = await getCategoryRepository().create(category);
      const newCategory = await getCategoryRepository().getById(id);
      
      if (newCategory) {
        set((state) => ({
          categories: [...state.categories, newCategory],
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateCategory: async (category: UpdateCategoryDTO) => {
    set({ loading: true, error: null });
    try {
      await getCategoryRepository().update(category);
      const updatedCategory = await getCategoryRepository().getById(category.id);
      
      if (updatedCategory) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === category.id ? updatedCategory : c
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await getCategoryRepository().delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  getCategoryExpenseCount: async (id: number): Promise<number> => {
    try {
      return await getCategoryRepository().getExpenseCount(id);
    } catch (error) {
      console.error('Error getting expense count:', error);
      return 0;
    }
  },
}));
