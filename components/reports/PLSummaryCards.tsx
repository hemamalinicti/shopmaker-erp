'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Receipt, ShoppingBag, TrendingUp, Wallet, Award, Info } from 'lucide-react';

export interface PLSummaryData {
  totalSales: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

export interface PLSummaryCardsProps {
  summary: PLSummaryData;
}

export const PLSummaryCards: React.FC<PLSummaryCardsProps> = ({ summary }) => {
  const isNetProfitPositive = summary.netProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Top 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Sales */}
        <Card className="border-l-4 border-l-sky-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Sales
            </span>
            <Receipt className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-lg md:text-xl font-extrabold text-slate-900">
            ₹{summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total value of completed bills</p>
        </Card>

        {/* Cost of Goods Sold (COGS) */}
        <Card className="border-l-4 border-l-amber-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              COGS (Product Cost)
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg md:text-xl font-extrabold text-slate-900">
            ₹{summary.cogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Purchase cost of items sold</p>
        </Card>

        {/* Gross Profit */}
        <Card className="border-l-4 border-l-indigo-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Gross Profit
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg md:text-xl font-extrabold text-indigo-700">
            ₹{summary.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-indigo-600 font-semibold mt-1">Sales minus product cost</p>
        </Card>

        {/* Total Expenses */}
        <Card className="border-l-4 border-l-rose-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <Wallet className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg md:text-xl font-extrabold text-slate-900">
            ₹{summary.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Operating expenses recorded</p>
        </Card>

        {/* Net Profit */}
        <Card
          className={`border-l-4 p-4 ${
            isNetProfitPositive ? 'border-l-emerald-500 bg-emerald-50/20' : 'border-l-red-500 bg-red-50/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Net Profit
            </span>
            <Award className={`w-4 h-4 ${isNetProfitPositive ? 'text-emerald-600' : 'text-red-600'}`} />
          </div>
          <p
            className={`text-lg md:text-xl font-extrabold ${
              isNetProfitPositive ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {isNetProfitPositive ? '+' : ''}₹
            {summary.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p
            className={`text-[10px] font-semibold mt-1 ${
              isNetProfitPositive ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            Gross profit minus operating expenses
          </p>
        </Card>
      </div>

      {/* Financial Flow Educational Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Accounting Equation:</strong> Total Sales (₹{summary.totalSales.toFixed(2)}) - COGS (₹
            {summary.cogs.toFixed(2)}) = Gross Profit (₹{summary.grossProfit.toFixed(2)}) • Gross Profit -
            Expenses (₹{summary.totalExpenses.toFixed(2)}) = <strong>Net Profit (₹{summary.netProfit.toFixed(2)})</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
