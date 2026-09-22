'use client';

import React from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface CartItem {
  productId: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stockQuantity: number;
  quantity: number;
}

export interface CartTableProps {
  items: CartItem[];
  billType: 'GST' | 'NON_GST';
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  billType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3 shadow-xs">
        <div className="bg-brand-50 text-brand-600 p-4 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center shadow-xs border border-brand-100">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">Billing Cart is Empty</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Search products above or click on items to add them directly to the billing counter.
        </p>
      </div>
    );
  }

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-0">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Cart Items ({items.length})
          </h4>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {totalItemCount} {totalItemCount === 1 ? 'unit' : 'units'}
          </span>
          <Badge variant={billType === 'GST' ? 'info' : 'neutral'} size="sm">
            {billType} BILL
          </Badge>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClearCart} icon={<Trash2 className="w-3.5 h-3.5" />}>
          Clear Cart
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/70 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Product Description</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-center">Quantity</th>
              {billType === 'GST' && <th className="py-2.5 px-3 text-right">GST %</th>}
              <th className="py-2.5 px-3 text-right">Line Total</th>
              <th className="py-2.5 px-3 text-center">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const itemSubtotal = item.sellingPrice * item.quantity;
              const itemGst = billType === 'GST' ? (itemSubtotal * item.gstRate) / 100 : 0;
              const lineTotal = itemSubtotal + itemGst;
              const isMaxStock = item.quantity >= item.stockQuantity;

              return (
                <tr key={item.productId} className="hover:bg-brand-50/40 transition-colors group">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-brand-700 transition-colors">
                        {item.name}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Avail. Stock: {item.stockQuantity} units
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-semibold text-slate-900">
                    ₹{item.sellingPrice.toFixed(2)}
                  </td>

                  {/* Enhanced Quantity Controls */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition-colors"
                        disabled={item.quantity <= 1}
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stockQuantity}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            onUpdateQuantity(item.productId, Math.min(val, item.stockQuantity));
                          }
                        }}
                        className="w-12 text-center text-xs font-extrabold border-x border-slate-200 py-1 focus:outline-none bg-slate-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition-colors"
                        disabled={isMaxStock}
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isMaxStock && (
                      <p className="text-[10px] text-amber-600 font-bold mt-0.5">Max Available Stock</p>
                    )}
                  </td>

                  {billType === 'GST' && (
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      {item.gstRate}%
                    </td>
                  )}

                  <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                    ₹{lineTotal.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId)}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
