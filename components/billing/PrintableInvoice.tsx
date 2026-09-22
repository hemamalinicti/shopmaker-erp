'use client';

import React from 'react';
import { Store, Printer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  billType: 'GST' | 'NON_GST';
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  createdAt: string;
  customer?: {
    name: string;
    phone: string;
    email?: string | null;
  } | null;
  shop: {
    shopName: string;
    address: string;
    gstNumber?: string | null;
    ownerPhone: string;
  };
  items: {
    id: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
    gstRate: number;
    total: number;
  }[];
}

export interface PrintableInvoiceProps {
  invoice: InvoiceDetails;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice }) => {
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Screen Action Bar (Hidden when printing) */}
      <div className="print:hidden bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tax Invoice / Receipt</h2>
          <p className="text-xs text-slate-500">Invoice #{invoice.invoiceNumber}</p>
        </div>
        <Button variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
          Print Invoice
        </Button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm print:shadow-none print:border-none print:p-0 text-slate-900 font-sans text-xs">
        {/* Shop Header */}
        <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-brand-600 text-white p-2.5 rounded-xl print:border print:border-slate-300">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                {invoice.shop.shopName}
              </h1>
              <p className="text-slate-500 max-w-sm text-[11px] leading-relaxed mt-0.5">
                {invoice.shop.address}
              </p>
              {invoice.shop.gstNumber && (
                <p className="text-slate-700 font-bold text-[11px] mt-1">
                  GSTIN: {invoice.shop.gstNumber}
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase mb-1">
              {invoice.billType} INVOICE
            </span>
            <p className="text-sm font-extrabold text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{formattedDate}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Billed To:
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {invoice.customer ? invoice.customer.name : 'Walk-in Customer'}
            </span>
          </div>
          {invoice.customer?.phone && (
            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Phone Number:
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                {invoice.customer.phone}
              </span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Product Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                {invoice.billType === 'GST' && <th className="py-2.5 px-3 text-right">GST %</th>}
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="text-slate-800">
                  <td className="py-2.5 px-3 font-medium text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-medium">₹{item.sellingPrice.toFixed(2)}</td>
                  {invoice.billType === 'GST' && (
                    <td className="py-2.5 px-3 text-right font-medium">{item.gstRate}%</td>
                  )}
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-slate-200 pt-4 mb-8">
          <div className="text-slate-500 text-[11px] space-y-1">
            <p className="font-semibold text-slate-700">Terms & Conditions:</p>
            <p>1. Goods once sold will not be taken back or exchanged.</p>
            <p>2. Subject to local jurisdiction.</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.billType === 'GST' && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span className="font-semibold text-slate-900">₹{invoice.gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-900 pt-2 text-sm font-extrabold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-brand-700">₹{invoice.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center border-t border-dashed border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Thank you for shopping with us!</p>
          <p>For support or queries, contact {invoice.shop.ownerPhone}</p>
        </div>
      </div>
    </div>
  );
};
