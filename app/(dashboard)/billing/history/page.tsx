'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { History, Search, Filter, Eye, MessageSquare, Plus, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getBillHistory } from '@/lib/actions/billActions';
import { generateWhatsAppBillUrl } from '@/lib/whatsapp';

function BillHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParam = searchParams?.get('search') || '';
  const typeParam = searchParams?.get('type') || 'ALL';

  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedType, setSelectedType] = useState(typeParam);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBillHistory({
        search: searchQuery,
        billType: selectedType,
      });
      setBills(data);
    } catch (err) {
      console.error('Error fetching bill history:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const updateUrl = (search: string, type: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type && type !== 'ALL') params.set('type', type);

    const q = params.toString();
    router.push(q ? `/billing/history?${q}` : '/billing/history');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-600" /> Sales & Bill History
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Review past sales invoices, reprint receipts, and share WhatsApp bills
          </p>
        </div>
        <Link href="/billing">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            New Bill
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by invoice #, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateUrl(e.target.value, selectedType);
            }}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-700">Bill Type:</span>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              updateUrl(searchQuery, e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="ALL">All Bill Types</option>
            <option value="GST">GST Bills</option>
            <option value="NON_GST">Non-GST Bills</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading bill history...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No bills found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-center">Items</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-right">Profit</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => {
                  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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
                      <td className="py-3 px-3 text-slate-500">{formattedDate}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {bill.customerName}
                        {bill.customerPhone && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {bill.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={bill.billType === 'GST' ? 'info' : 'neutral'} size="sm">
                          {bill.billType}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {bill.itemsCount}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{bill.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                        +₹{bill.profitAmount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/billing/${bill.id}`} target="_blank">
                            <button
                              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                              title="View & Print Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          {whatsAppUrl ? (
                            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
                              <button
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Share on WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </a>
                          ) : (
                            <span className="p-1.5 text-slate-300 cursor-not-allowed" title="No Customer Phone">
                              <MessageSquare className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function BillHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">Loading bill history...</div>
      }
    >
      <BillHistoryContent />
    </Suspense>
  );
}
