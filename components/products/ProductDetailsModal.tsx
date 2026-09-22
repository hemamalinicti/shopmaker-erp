'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StockStatus } from '@/lib/calculations';
import { Tag, TrendingUp, Layers, Percent, Calendar } from 'lucide-react';

export interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
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
  } | null;
  onEditClick?: () => void;
  onStockAdjustClick?: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onEditClick,
  onStockAdjustClick,
}) => {
  if (!product) return null;

  const stockBadgeVariant =
    product.stockStatus === 'OUT_OF_STOCK'
      ? 'danger'
      : product.stockStatus === 'LOW_STOCK'
      ? 'warning'
      : 'success';

  const stockStatusLabel =
    product.stockStatus === 'OUT_OF_STOCK'
      ? 'OUT OF STOCK'
      : product.stockStatus === 'LOW_STOCK'
      ? 'LOW STOCK'
      : 'IN STOCK';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      subtitle={`Category: ${product.category}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {onStockAdjustClick && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onStockAdjustClick();
                }}
              >
                Update Stock
              </Button>
            )}
            {onEditClick && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEditClick();
                }}
              >
                Edit Details
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Header Status Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">{product.category}</span>
          </div>
          <Badge variant={stockBadgeVariant} size="md">
            {stockStatusLabel}
          </Badge>
        </div>

        {/* Pricing & Profit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Purchase Price
            </span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              ₹{product.purchasePrice.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Selling Price
            </span>
            <span className="text-lg font-extrabold text-brand-700 mt-1 block">
              ₹{product.sellingPrice.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Unit Potential Profit
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
              +₹{product.potentialUnitProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stock & Tax Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Layers className="w-4 h-4 text-slate-600" /> Inventory Information
            </div>
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
              <span>Current Stock Balance:</span>
              <strong className="text-slate-900">{product.stockQuantity} units</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Low Stock Alert Limit:</span>
              <strong className="text-slate-900">{product.lowStockLimit} units</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Percent className="w-4 h-4 text-slate-600" /> Tax & Registration
            </div>
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2">
              <span>GST Applicable Rate:</span>
              <strong className="text-slate-900">{product.gstRate}%</strong>
            </div>
            {product.createdAt && (
              <div className="flex justify-between text-slate-600">
                <span>Date Added:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Potential unit profit is calculated as (Selling Price - Purchase Price). Realized profit is logged upon billing.
        </p>
      </div>
    </Modal>
  );
};
