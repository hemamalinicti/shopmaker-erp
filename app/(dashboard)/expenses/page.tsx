'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ExpenseTable, ExpenseItem } from '@/components/expenses/ExpenseTable';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal';
import { DeleteExpenseDialog } from '@/components/expenses/DeleteExpenseDialog';
import { getExpenses, getExpenseSummary } from '@/lib/actions/expenseActions';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [summary, setSummary] = useState({
    todayTotal: 0,
    monthTotal: 0,
    categoryBreakdown: { CURRENT: 0, EB: 0, SALARY: 0, OTHER: 0 },
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);

  const fetchExpensesData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedExpenses, fetchedSummary] = await Promise.all([
        getExpenses({
          search: searchQuery,
          category: selectedCategory,
        }),
        getExpenseSummary(),
      ]);
      setExpenses(fetchedExpenses);
      setSummary(fetchedSummary);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-600" /> Daily Store Expenses
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Track store operational expenses (EB bills, staff salaries, tea, and maintenance)
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Expense
        </Button>
      </div>

      {/* Expense KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        <Card className="sm:col-span-2 border-l-4 border-l-amber-500 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Today&apos;s Expenses
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
            ₹{summary.todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Recorded for today</p>
        </Card>

        <Card className="sm:col-span-2 border-l-4 border-l-sky-500 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            This Month&apos;s Expenses
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
            ₹{summary.monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Total operational expenses this month</p>
        </Card>

        {/* Category Breakdown Small Card */}
        <div className="sm:col-span-2 bg-slate-900 text-white p-4 rounded-xl shadow-xs space-y-1.5 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Today&apos;s Category Breakdown
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Current:</span>
              <strong className="text-white">₹{summary.categoryBreakdown.CURRENT.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EB Bill:</span>
              <strong className="text-white">₹{summary.categoryBreakdown.EB.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Salary:</span>
              <strong className="text-white">₹{summary.categoryBreakdown.SALARY.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Other:</span>
              <strong className="text-white">₹{summary.categoryBreakdown.OTHER.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search expense description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="CURRENT">CURRENT</option>
              <option value="EB">EB BILL</option>
              <option value="SALARY">SALARY</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'ALL') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <ExpenseTable
        expenses={expenses}
        loading={loading}
        onEdit={(e) => setEditingExpense(e)}
        onDelete={(e) => setDeletingExpense(e)}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchExpensesData}
      />

      <EditExpenseModal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        onSuccess={fetchExpensesData}
      />

      <DeleteExpenseDialog
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        expense={deletingExpense}
        onSuccess={fetchExpensesData}
      />
    </div>
  );
}
