export interface Account {
  id: number;
  name: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDTO {
  name: string;
  balance: number;
  currency: string;
}

export interface UpdateAccountDTO {
  id: number;
  name?: string;
  balance?: number;
  currency?: string;
}
