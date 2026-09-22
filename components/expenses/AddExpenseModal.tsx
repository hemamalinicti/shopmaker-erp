'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createExpense } from '@/lib/actions/expenseActions';
import { Plus } from 'lucide-react';

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [category, setCategory] = useState<'CURRENT' | 'EB' | 'SALARY' | 'OTHER'>('CURRENT');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!category) {
      setError('Category is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!expenseDate) {
      setError('Expense date is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await createExpense({
        category,
        description: description.trim(),
        amount: parsedAmount,
        expenseDate,
      });

      setLoading(false);

      if (res.success) {
        setDescription('');
        setAmount('');
        setCategory('CURRENT');
        setExpenseDate(todayStr);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to record expense.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred while saving expense.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Daily Expense"
      subtitle="Log operational store expenses for accurate P&L calculation"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Expense Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="CURRENT">CURRENT - Daily Tea, Refreshments & Water</option>
            <option value="EB">EB - Electricity Board Bill</option>
            <option value="SALARY">SALARY - Staff Salary & Advance</option>
            <option value="OTHER">OTHER - Cleaning, Repairs & Misc Supplies</option>
          </select>
        </div>

        <Input
          label="Expense Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. September electricity bill payment"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2450"
            required
          />

          <Input
            label="Expense Date *"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} icon={<Plus className="w-4 h-4" />}>
            {loading ? 'Saving Expense...' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
