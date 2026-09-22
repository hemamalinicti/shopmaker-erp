import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  Receipt,
  Plus,
  Package,
  PackageX,
  Share2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProductDashboardMetrics, getProducts } from '@/lib/actions/productActions';
import { getBillHistory } from '@/lib/actions/billActions';
import { getDailyProfitLossReport } from '@/lib/actions/reportActions';
import { generateWhatsAppBillUrl } from '@/lib/whatsapp';
import { getSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getSession();
  const isOwner = !session || session.role === 'OWNER';

  // Dynamic metrics based on user role
  const stockMetrics = isOwner ? await getProductDashboardMetrics() : { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0 };
  const lowStockItems = isOwner ? await getProducts({ stockStatus: 'low' }) : [];
  const todayReport = isOwner ? await getDailyProfitLossReport(undefined, { skipRoleCheck: true }) : null;
  const recentBills = await getBillHistory();

  const todayTotalSales = recentBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const todayBillsCount = recentBills.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {isOwner ? 'Shop Overview' : 'Billing Counter Dashboard'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {isOwner
              ? 'Real-time billing overview, financial summaries, and inventory health'
              : 'Billing counter terminal, customer invoicing, and bill history'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/billing">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Create Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Today&apos;s Sales
              </p>
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                ₹{(todayReport ? todayReport.totalSales : todayTotalSales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {todayReport ? todayReport.billCount : todayBillsCount} Bills generated today
              </p>
            </div>
            <div className="bg-sky-50 text-sky-600 p-3 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {isOwner && todayReport ? (
          <>
            {/* Today's Expenses (Owner Only) */}
            <Card className="border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Today&apos;s Expenses
                  </p>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
                    ₹{todayReport.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Operating store expenses
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </Card>

            {/* Today's Net Profit (Owner Only) */}
            <Card className="border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Today&apos;s Net Profit
                  </p>
                  <h3
                    className={`text-xl md:text-2xl font-extrabold mt-1 ${
                      todayReport.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {todayReport.netProfit >= 0 ? '+' : ''}₹
                    {todayReport.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Gross profit minus expenses
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </Card>

            {/* Low Stock Alert Card (Owner Only) */}
            <Link href="/products?stock=low" className="block group">
              <Card className="border-l-4 border-l-rose-500 hover:border-rose-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Low Stock Products
                    </p>
                    <h3 className="text-xl md:text-2xl font-extrabold text-rose-700 mt-1 group-hover:text-rose-800 transition-colors">
                      {stockMetrics.lowStockCount} Products
                    </h3>
                    <p className="text-[11px] text-rose-600 font-medium mt-1 group-hover:underline">
                      Click to view & restock →
                    </p>
                  </div>
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl group-hover:bg-rose-100 transition-colors">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </Link>
          </>
        ) : (
          <>
            {/* Cashier Quick Billing Counter Card */}
            <Card className="border-l-4 border-l-brand-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Billing Counter
                  </p>
                  <h3 className="text-xl md:text-2xl font-extrabold text-brand-700 mt-1">
                    Active Terminal
                  </h3>
                  <p className="text-[11px] text-brand-600 font-medium mt-1">
                    Ready for billing transactions
                  </p>
                </div>
                <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
                  <Boxes className="w-6 h-6" />
                </div>
              </div>
            </Card>

            {/* Cashier Quick Customer Management Card */}
            <Link href="/customers" className="block group">
              <Card className="border-l-4 border-l-emerald-500 hover:border-emerald-600 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer Lookup
                    </p>
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                      Directory
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 group-hover:underline">
                      View customers →
                    </p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                    <Receipt className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Main Grid: Recent Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bills (2 or 3 Columns) */}
        <div className={isOwner ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
          <Card
            title="Recent Sales Bills"
            subtitle="Latest transactions processed today"
            action={
              <Link href="/billing/history">
                <Button size="sm" variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
                  View History
                </Button>
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    {isOwner && <th className="py-2.5 px-3 text-right">Profit</th>}
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBills.slice(0, 5).map((bill) => {
                    const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });

                    const whatsAppUrl = bill.customerPhone
                      ? generateWhatsAppBillUrl(
                          bill.customerPhone,
                          {
                            invoiceNumber: bill.invoiceNumber,
                            customerName: bill.customerName,
                            totalAmount: bill.totalAmount,
                            billDate: formattedDate,
                            itemCount: bill.itemsCount,
                          },
                          'ShopMaster Store'
                        )
                      : null;

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{bill.invoiceNumber}</td>
                        <td className="py-3 px-3 font-medium text-slate-700">{bill.customerName}</td>
                        <td className="py-3 px-3">
                          <Badge variant={bill.billType === 'GST' ? 'info' : 'neutral'} size="sm">
                            {bill.billType}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ₹{bill.totalAmount.toFixed(2)}
                        </td>
                        {isOwner && (
                          <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                            +₹{bill.profitAmount.toFixed(2)}
                          </td>
                        )}
                        <td className="py-3 px-3 text-center">
                          {whatsAppUrl ? (
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1 text-[11px]"
                            >
                              <Share2 className="w-3 h-3" /> WhatsApp
                            </a>
                          ) : (
                            <Link
                              href={`/billing/${bill.id}`}
                              className="text-slate-600 hover:text-slate-900 text-[11px] font-medium"
                            >
                              View Invoice
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Low Stock Warning Sidebar (Owner Only) */}
        {isOwner && (
          <div className="space-y-4">
            <Card
              title="Low Stock Warning"
              subtitle="Products reaching re-order limit"
              action={
                <Link href="/products?stock=low">
                  <Button size="sm" variant="ghost" icon={<ArrowRight className="w-4 h-4" />}>
                    Restock All
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No low stock items currently.</p>
                ) : (
                  lowStockItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={item.stockQuantity === 0 ? 'danger' : 'warning'} size="sm">
                          {item.stockQuantity} left
                        </Badge>
                        <p className="text-[10px] text-slate-400 mt-0.5">Limit: {item.lowStockLimit}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
