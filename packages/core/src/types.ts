export type BusinessTransactionType = 'income' | 'expense' | 'deposit';

export interface MemberSavings {
  id: string;
  member_id: string;
  amount: number;
  type: string;
  status?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  member_id: string;
  loan_number?: string;
  amount: number;
  principal?: number;
  status: string;
  interest_rate: number;
  repayment_period: number;
  disbursement_date?: string | Date;
  created_at: string;
}

export interface BusinessTransaction {
  id: string;
  business_id: string;
  amount: number;
  type: BusinessTransactionType;
  category: string;
  description: string;
  created_at: string;
}

export interface Member {
  id: string;
  organization_id: string;
  profile_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  member_number: string;
  status: string;
  joined_at: Date | string;
  savings_balance?: number;
  shares?: number;
  is_approved?: boolean;
  share_value?: number;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string;
}
