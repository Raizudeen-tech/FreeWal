export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateCategoryDTO {
  id: number;
  name?: string;
  color?: string;
  icon?: string;
}
