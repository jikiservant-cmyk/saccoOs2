/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { addBusinessTransaction, topUpWallet, withdrawFromWallet } from './actions';
import { BusinessTransactionType, ROLES } from '@sacco/core';

interface QuickActionsProps {
  businessId: string;
  role: string | null;
  context?: 'business' | 'wallet' | 'all';
}

export default function QuickActions({ businessId, role, context = 'all' }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<BusinessTransactionType | 'topup' | 'withdraw'>('income');
  const [loading, setLoading] = useState(false);

  const openModal = (t: BusinessTransactionType | 'transfer' | 'reports' | 'topup' | 'withdraw') => {
    if (t === 'transfer' || t === 'reports') {
      alert(`${t.charAt(0).toUpperCase() + t.slice(1)} module coming soon!`);
      return;
    }
    setType(t);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('date', new Date().toISOString());

    if (type === 'topup') {
      const amount = parseFloat(formData.get('amount') as string);
      const description = formData.get('description') as string;
      const result = await topUpWallet(amount, description || 'Top Up Wallet');
      setLoading(false);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert('Error: ' + result.error);
      }
      return;
    }
    
    if (type === 'withdraw') {
      const amount = parseFloat(formData.get('amount') as string);
      const description = formData.get('description') as string;
      const result = await withdrawFromWallet(amount, description || 'Withdraw from Wallet');
      setLoading(false);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert('Error: ' + result.error);
      }
      return;
    }

    if (!businessId) {
      alert("No business found!");
      setLoading(false);
      return;
    }

    formData.append('businessId', businessId);
    formData.append('type', type as string);
    const result = await addBusinessTransaction(formData);
    setLoading(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      alert('Error: ' + result.error);
    }
  };

  const actions = [];
  if ((context === 'business' || context === 'all') && role === ROLES.SME_OWNER) {
    actions.push({ label: 'Income', icon: 'inc', type: 'income' as const, path: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /> });
    actions.push({ label: 'Expense', icon: 'exp', type: 'expense' as const, path: <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /> });
  }
  
  if ((context === 'wallet' || context === 'all') && (role === ROLES.MEMBER || role === ROLES.SME_OWNER)) {
    actions.push({ label: 'Top Up', icon: 'trf', type: 'topup' as const, path: <><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> });
    actions.push({ label: 'Withdraw', icon: 'rep', type: 'withdraw' as const, path: <><polyline points="17 11 12 16 7 11"/><line x1="12" y1="4" x2="12" y2="16"/><line x1="4" y1="20" x2="20" y2="20"/></> });
  }

  // Determine button styles based on context
  const isWalletContext = context === 'wallet';

  return (
    <>
      <div className={`actions-grid w-full grid gap-[10px] ${isWalletContext ? 'mb-0' : 'mb-[26px]'} ${
        actions.length === 4 ? 'grid-cols-4' : 
        actions.length === 2 ? 'grid-cols-2' : 
        'grid-cols-3'
      }`}>
        {actions.map((action) => (
          <button 
            key={action.label} 
            onClick={() => openModal(action.type)}
            className={`action-btn flex flex-col items-center gap-[9px] ${
              isWalletContext 
                ? 'bg-white/10 border border-white/10 text-white hover:bg-white/20' 
                : 'bg-[var(--card)] border border-[var(--border2)] hover:shadow-[0_8px_24px_rgba(14,140,114,0.15)]'
            } rounded-[18px] p-[16px_6px_13px] cursor-pointer transition-all hover:-translate-y-[3px] active:scale-[0.96]`}
          >
            <div className={`a-ico ${action.icon} w-[44px] h-[44px] rounded-[14px] flex items-center justify-center
              ${isWalletContext 
                 ? 'bg-white/20 text-white' 
                 : action.icon === 'inc' ? 'bg-[var(--green-lt)] text-[var(--green)]' 
                 : action.icon === 'exp' ? 'bg-[var(--red-lt)] text-[var(--red)]' 
                 : action.icon === 'trf' ? 'bg-[var(--teal-lt)] text-[var(--teal)]' 
                 : 'bg-[var(--gold-lt)] text-[var(--gold-dark)]'}
            `}>
              <svg className="w-[20px] h-[20px] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                {action.path}
                {action.icon === 'inc' && <polyline points="17 6 23 6 23 12" />}
                {action.icon === 'exp' && <polyline points="17 18 23 18 23 12" />}
              </svg>
            </div>
            <span className={`a-lbl text-[11px] font-semibold ${isWalletContext ? 'text-white/80' : 'text-[var(--muted)]'}`}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[400px] bg-white rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-[var(--navy)]">
                Add {type.charAt(0).toUpperCase() + type.slice(1)}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-[var(--muted2)] hover:text-[var(--navy)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[2px] text-[var(--muted2)] mb-2">Amount (UGX)</label>
                <input 
                  name="amount" 
                  type="number" 
                  required 
                  autoFocus
                  className="w-full px-4 py-3.5 bg-[var(--bg)]/30 border border-[var(--border2)] rounded-2xl text-lg font-serif font-bold text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
                  placeholder="0"
                />
              </div>

              {type !== 'topup' && type !== 'withdraw' && (
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-[2px] text-[var(--muted2)] mb-2">Category</label>
                  <select 
                    name="category" 
                    required={type === 'income' || type === 'expense'}
                    className="w-full px-4 py-3.5 bg-[var(--bg)]/30 border border-[var(--border2)] rounded-2xl text-sm font-sans font-medium text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20 appearance-none"
                  >
                    {type === 'income' ? (
                      <>
                        <option value="Sales">Product Sales</option>
                        <option value="Service">Service Fee</option>
                        <option value="Salary">Salary</option>
                        <option value="Other">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Inventory">Inventory/Stock</option>
                        <option value="Rent">Rent</option>
                        <option value="Utilities">Utilities (Water/Power)</option>
                        <option value="Transport">Transport</option>
                        <option value="Lunch">Lunch/Meals</option>
                        <option value="Other">Other Expense</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[2px] text-[var(--muted2)] mb-2">Description</label>
                <input 
                  name="description" 
                  type="text" 
                  required
                  className="w-full px-4 py-3.5 bg-[var(--bg)]/30 border border-[var(--border2)] rounded-2xl text-sm font-sans text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/20"
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[2px] text-[var(--muted2)] mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Cash', 'Mobile Money'].map((m) => (
                    <label key={m} className="flex items-center gap-3 p-3 bg-[var(--bg)]/30 border border-[var(--border2)] rounded-xl cursor-pointer hover:bg-[var(--teal-lt)] transition-colors">
                      <input type="radio" name="paymentMethod" value={m} defaultChecked={m === 'Cash'} className="accent-[var(--teal)]" />
                      <span className="text-xs font-bold text-[var(--navy)]">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                disabled={loading}
                className="w-full py-4 bg-[var(--navy)] text-[var(--gold)] font-bold uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Save ${type}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
