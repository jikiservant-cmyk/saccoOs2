'use server';

import { createClient } from '@/utils/supabase/server';
import { BusinessTransaction, BusinessTransactionType } from '@sacco/core';
import { revalidatePath } from 'next/cache';

export async function getBusinessTransactions(businessId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    
    .from('business_transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching business transactions:', error);
    return [];
  }

  return data as BusinessTransaction[];
}

export async function addBusinessTransaction(formData: FormData) {
  const supabase = await createClient();
  
  const businessId = formData.get('businessId') as string;
  const type = formData.get('type') as BusinessTransactionType;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const transactionDate = formData.get('date') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    
    .from('business_transactions')
    .insert([
      {
        business_id: businessId,
        transaction_type: type,
        amount,
        category,
        description,
        payment_method: paymentMethod,
        transaction_date: transactionDate,
        created_by: user.id,
      },
    ]);

  if (error) {
    console.error('Error adding transaction:', error);
    return { error: error.message };
  }

  revalidatePath('/cashbook');
  return { success: true };
}

export async function topUpWallet(amount: number, description: string) {
  return depositToSacco(amount, description);
}

export async function withdrawFromWallet(amount: number, _description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: orgRole } = await supabase
    .from('user_org_roles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!orgRole) return { error: 'Not a member of any SACCO' };

  const { data: userWallet } = await supabase
    
    .schema('sacco').from('wallets')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (!userWallet || userWallet.balance < amount) {
    return { error: 'Insufficient funds' };
  }

  await supabase.schema('sacco').from('wallets')
    .update({ balance: userWallet.balance - amount })
    .eq('id', userWallet.id);

  const { data: saccoWallets } = await supabase
    
    .schema('sacco').from('wallets')
    .select('*')
    .eq('organization_id', orgRole.organization_id);

  const saccoWallet = saccoWallets && saccoWallets.length > 0 ? saccoWallets[0] : null;

  if (saccoWallet) {
     await supabase.schema('sacco').from('wallets')
      .update({ balance: saccoWallet.balance - amount })
      .eq('id', saccoWallet.id);
  }

  revalidatePath('/cashbook');
  revalidatePath('/admin');
  return { success: true };
}
export async function depositToSacco(amount: number, _description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Find the SACCO that this user belongs to
  const { data: orgRole } = await supabase
    .from('user_org_roles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!orgRole) return { error: 'Not a member of any SACCO' };

  // 2. Add to user's wallet (or create if not exist)
  let { data: userWallet } = await supabase
    
    .schema('sacco').from('wallets')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (!userWallet) {
    const { data: newWallet, error: createWalletError } = await supabase
      
      .schema('sacco').from('wallets')
      .insert({ profile_id: user.id, balance: amount })
      .select()
      .single();
    if (createWalletError) return { error: 'Failed to create personal wallet' };
    userWallet = newWallet;
  } else {
    // update balance
    await supabase.schema('sacco').from('wallets')
      .update({ balance: userWallet.balance + amount })
      .eq('id', userWallet.id);
  }

  // 3. Add to SACCO's global wallet
  const { data: saccoWallets } = await supabase
    
    .schema('sacco').from('wallets')
    .select('*')
    .eq('organization_id', orgRole.organization_id);

  let saccoWallet = saccoWallets && saccoWallets.length > 0 ? saccoWallets[0] : null;

  if (!saccoWallet) {
     const { data: newSaccoWallet } = await supabase
      
      .schema('sacco').from('wallets')
      .insert({ organization_id: orgRole.organization_id, balance: amount })
      .select()
      .single();
     saccoWallet = newSaccoWallet;
  } else {
     await supabase.schema('sacco').from('wallets')
      .update({ balance: saccoWallet.balance + amount })
      .eq('id', saccoWallet.id);
  }

  revalidatePath('/cashbook');
  revalidatePath('/admin');
  return { success: true };
}
export async function getBusinessAnalytics(businessId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    
    .from('business_analytics_snapshots')
    .select('*')
    .eq('business_id', businessId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found is not an error for analytics
    console.error('Error fetching business analytics:', error);
    return null;
  }

  return data;
}

export async function getBusinessCreditProfile(businessId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    
    .from('business_credit_profiles')
    .select('*')
    .eq('business_id', businessId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found is not an error
    console.error('Error fetching credit profile:', error);
    return null;
  }

  return data;
}

