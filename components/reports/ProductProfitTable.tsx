'use client';

import React from 'react';
import { ProductProfitSummaryItem } from '@/lib/actions/reportActions';
import { Package, TrendingUp } from 'lucide-react';

export interface ProductProfitTableProps {
  items: ProductProfitSummaryItem[];
}

export const ProductProfitTable: React.FC<ProductProfitTableProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        No product sales recorded for this date.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            <th className="py-3 px-3">Product Name</th>
            <th className="py-3 px-3">Category</th>
            <th className="py-3 px-3 text-center">Qty Sold</th>
            <th className="py-3 px-3 text-right">Sales Value</th>
            <th className="py-3 px-3 text-right">Product Cost</th>
            <th className="py-3 px-3 text-right">Realized Profit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
              <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
              <td className="py-3 px-3 text-slate-600">{item.category}</td>
              <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantitySold}</td>
              <td className="py-3 px-3 text-right font-medium text-slate-900">
                ₹{item.totalSales.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-medium text-slate-600">
                ₹{item.totalCost.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-extrabold text-emerald-600">
                +₹{item.realizedProfit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
