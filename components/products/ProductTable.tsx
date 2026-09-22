'use client';

import React from 'react';
import { Eye, Edit2, Layers, Trash2, PackageOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StockStatus } from '@/lib/calculations';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stockQuantity: number;
  lowStockLimit: number;
  stockStatus: StockStatus;
  potentialUnitProfit: number;
  createdAt?: string;
}

export interface ProductTableProps {
  products: ProductItem[];
  loading?: boolean;
  onView: (product: ProductItem) => void;
  onEdit: (product: ProductItem) => void;
  onStockAdjust: (product: ProductItem) => void;
  onDelete: (product: ProductItem) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  onView,
  onEdit,
  onStockAdjust,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading inventory products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
        <div className="bg-slate-100 text-slate-400 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your search or filter criteria returned no matching items, or your inventory is empty. Click &quot;Add Product&quot; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Product Name</th>
              <th className="py-3.5 px-3">Category</th>
              <th className="py-3.5 px-3 text-right">Purchase Price</th>
              <th className="py-3.5 px-3 text-right">Selling Price</th>
              <th className="py-3.5 px-3 text-right">GST Rate</th>
              <th className="py-3.5 px-3 text-center">Stock</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const badgeVariant =
                p.stockStatus === 'OUT_OF_STOCK'
                  ? 'danger'
                  : p.stockStatus === 'LOW_STOCK'
                  ? 'warning'
                  : 'success';

              const badgeLabel =
                p.stockStatus === 'OUT_OF_STOCK'
                  ? 'OUT OF STOCK'
                  : p.stockStatus === 'LOW_STOCK'
                  ? 'LOW STOCK'
                  : 'IN STOCK';

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-tight">{p.name}</p>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        Unit Margin: +₹{p.potentialUnitProfit.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{p.category}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600">
                    ₹{p.purchasePrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{p.sellingPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600">{p.gstRate}%</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    <span className={p.stockQuantity <= p.lowStockLimit ? 'text-rose-600' : 'text-slate-900'}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={badgeVariant} size="sm">
                      {badgeLabel}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onView(p)}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStockAdjust(p)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Update Stock Balance"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete / Archive Product"
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
