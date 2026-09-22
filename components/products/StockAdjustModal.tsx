'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adjustStock } from '@/lib/actions/productActions';
import { Plus, Minus, AlertTriangle, Layers } from 'lucide-react';

export interface StockAdjustTarget {
  id: string;
  name: string;
  stockQuantity: number;
}

export interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StockAdjustTarget | null;
  onSuccess?: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [direction, setDirection] = useState<'ADD' | 'REMOVE'>('ADD');
  const [quantity, setQuantity] = useState('5');
  const [reason, setReason] = useState('Stock received');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (product) {
      setDirection('ADD');
      setQuantity('5');
      setReason('Stock received');
      setCustomReason('');
      setError('');
      setSuccessMsg('');
    }
  }, [product]);

  if (!product) return null;

  const currentStock = product.stockQuantity;
  const parsedQty = parseInt(quantity, 10) || 0;
  const adjustmentQty = direction === 'ADD' ? Math.abs(parsedQty) : -Math.abs(parsedQty);
  const newStock = currentStock + adjustmentQty;
  const isInvalidStock = newStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (parsedQty <= 0) {
      setError('Please enter a valid quantity greater than zero.');
      return;
    }

    if (isInvalidStock) {
      setError(`Cannot reduce stock below zero. Current stock is ${currentStock}.`);
      return;
    }

    const finalReason = reason === 'Other' ? customReason : reason;

    setLoading(true);

    try {
      const res = await adjustStock(product.id, adjustmentQty, finalReason);
      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.message || 'Stock adjusted successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setError(res.error || 'Failed to adjust stock.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred while adjusting stock.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Stock - ${product.name}`}
      subtitle="Adjust inventory stock balance with transaction logging"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* Current Stock Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Stock</p>
            <h4 className="text-2xl font-extrabold mt-0.5">{currentStock} units</h4>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-lg text-slate-300">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Action Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection('ADD')}
              className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                direction === 'ADD'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" /> Add Stock (+)
            </button>
            <button
              type="button"
              onClick={() => setDirection('REMOVE')}
              className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                direction === 'REMOVE'
                  ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Minus className="w-4 h-4" /> Reduce Stock (-)
            </button>
          </div>
        </div>

        {/* Quantity Input */}
        <Input
          label="Adjustment Quantity *"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 5"
          required
        />

        {/* Reason Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="Stock received">Stock received from supplier</option>
            <option value="Damaged / Expired">Damaged / Expired stock removal</option>
            <option value="Inventory Correction">Physical count correction</option>
            <option value="Other">Other reason</option>
          </select>
        </div>

        {reason === 'Other' && (
          <Input
            label="Specify Reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Enter reason details"
          />
        )}

        {/* Resulting Stock Preview */}
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${
            isInvalidStock
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <span>Resulting New Stock:</span>
          <span className={`text-sm font-extrabold ${isInvalidStock ? 'text-red-600' : 'text-slate-900'}`}>
            {newStock} units
          </span>
        </div>

        {isInvalidStock && (
          <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" /> Operation will result in negative stock balance.
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={direction === 'ADD' ? 'primary' : 'danger'}
            disabled={loading || isInvalidStock}
          >
            {loading ? 'Saving...' : `Save Stock (${direction === 'ADD' ? '+' : '-'}${parsedQty})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
