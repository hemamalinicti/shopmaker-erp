'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, Receipt, Wallet, Package, ArrowRight, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ReportDateSelector } from '@/components/reports/ReportDateSelector';
import { PLSummaryCards } from '@/components/reports/PLSummaryCards';
import { ProductProfitTable } from '@/components/reports/ProductProfitTable';
import { getDailyProfitLossReport, DailyReportData } from '@/lib/actions/reportActions';

export default function ReportsPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyProfitLossReport(selectedDate);
      setReport(data);
    } catch (err) {
      console.error('Error fetching P&L report:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" /> Daily Profit & Loss Report
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real financial accounting breakdown: Sales - COGS = Gross Profit • Gross Profit - Operating Expenses = Net Profit
          </p>
        </div>
      </div>

      {/* Date Selector Control */}
      <ReportDateSelector selectedDate={selectedDate} onDateChange={(d) => setSelectedDate(d)} />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Calculating P&L report for {selectedDate}...</p>
        </div>
      ) : !report ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          Not enough transaction data for this date.
        </div>
      ) : (
        <>
          {/* Main KPI P&L Summary Cards */}
          <PLSummaryCards summary={report} />

          {/* Educational Accounting Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block">Total Sales</span>
              <span className="text-slate-500 text-[11px]">Total value of completed customer bills on date.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block">COGS (Product Cost)</span>
              <span className="text-slate-500 text-[11px]">Purchase cost of products sold today.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block">Gross Profit</span>
              <span className="text-slate-500 text-[11px]">Sales revenue minus product purchase cost.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block">Operating Expenses</span>
              <span className="text-slate-500 text-[11px]">Store operational expenses recorded for date.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block">Net Profit</span>
              <span className="text-slate-500 text-[11px]">Gross profit minus operating expenses.</span>
            </div>
          </div>

          {/* Breakdown Grid: Sales Overview & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Details Card */}
            <Card
              title="Daily Sales Summary"
              subtitle={`Activity for ${report.dateString}`}
              action={
                <Link href="/billing/history">
                  <Button size="sm" variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
                    View Invoices
                  </Button>
                </Link>
              }
            >
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Bills Generated
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">{report.billCount}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Items Sold
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">{report.itemsSold}</span>
                </div>

                <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                  <span className="text-[10px] uppercase font-bold text-sky-700 block">
                    Sales Value
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ₹{report.totalSales.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Operating Expenses Breakdown Card */}
            <Card title="Operating Expense Breakdown" subtitle={`Categorized costs for ${report.dateString}`}>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">CURRENT (Tea, Water & Refreshments):</span>
                  <span className="font-bold text-slate-900">₹{report.expenseBreakdown.CURRENT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">EB (Electricity Bill):</span>
                  <span className="font-bold text-slate-900">₹{report.expenseBreakdown.EB.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">SALARY (Staff Advance & Salary):</span>
                  <span className="font-bold text-slate-900">₹{report.expenseBreakdown.SALARY.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">OTHER (Maintenance & Repairs):</span>
                  <span className="font-bold text-slate-900">₹{report.expenseBreakdown.OTHER.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                  <span>Total Expenses:</span>
                  <span className="text-rose-600">₹{report.totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Product-Level Profit Contribution Summary */}
          <Card
            title="Product Profit Contribution"
            subtitle="Item-level sales, cost of goods sold, and realized margin breakdown"
          >
            <ProductProfitTable items={report.productProfitSummary} />
          </Card>
        </>
      )}
    </div>
  );
}
