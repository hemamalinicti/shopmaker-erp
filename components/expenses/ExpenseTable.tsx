'use client';

import React from 'react';
import { Edit2, Trash2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface ExpenseItem {
  id: string;
  category: 'CURRENT' | 'EB' | 'SALARY' | 'OTHER';
  description: string;
  amount: number;
  expenseDate: string;
  createdAt?: string;
}

export interface ExpenseTableProps {
  expenses: ExpenseItem[];
  loading?: boolean;
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (expense: ExpenseItem) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  loading = false,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading store expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
        <div className="bg-slate-100 text-slate-400 p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
          <Wallet className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Expenses Recorded</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No operational expenses were found for the selected filter criteria. Click &quot;Record Expense&quot; to log a new store expense.
        </p>
      </div>
    );
  }

  const categoryBadges: Record<string, { variant: 'warning' | 'info' | 'danger' | 'neutral'; label: string }> = {
    CURRENT: { variant: 'info', label: 'CURRENT' },
    EB: { variant: 'warning', label: 'EB BILL' },
    SALARY: { variant: 'neutral', label: 'SALARY' },
    OTHER: { variant: 'danger', label: 'OTHER' },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((e) => {
              const formattedDate = new Date(e.expenseDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const badgeInfo = categoryBadges[e.category] || { variant: 'neutral', label: e.category };

              return (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{formattedDate}</td>
                  <td className="py-3 px-3">
                    <Badge variant={badgeInfo.variant} size="sm">
                      {badgeInfo.label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{e.description}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    ₹{e.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(e)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(e)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
