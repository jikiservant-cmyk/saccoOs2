export type BusinessTransactionType = 'income' | 'expense' | 'deposit';

export interface BusinessTransaction {
  id: string;
  business_id: string;
  amount: number;
  type: BusinessTransactionType;
  category: string;
  description: string;
  created_at: string;
}
