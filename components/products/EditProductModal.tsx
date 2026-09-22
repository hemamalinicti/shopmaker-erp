'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateProduct } from '@/lib/actions/productActions';
import { Save, Info } from 'lucide-react';

export interface ProductToEdit {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stockQuantity: number;
  lowStockLimit: number;
}

export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductToEdit | null;
  categories: string[];
  onSuccess?: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    gstRate: '',
    lowStockLimit: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        purchasePrice: product.purchasePrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        gstRate: product.gstRate.toString(),
        lowStockLimit: product.lowStockLimit.toString(),
      });
      setError('');
      setSuccessMsg('');
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const gstRate = parseFloat(formData.gstRate);
    const lowStockLimit = parseInt(formData.lowStockLimit, 10);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required.');
      return;
    }
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      setError('Purchase price must be a non-negative number.');
      return;
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      setError('Selling price must be a non-negative number.');
      return;
    }
    if (isNaN(gstRate) || gstRate < 0) {
      setError('GST rate must be a non-negative number.');
      return;
    }
    if (isNaN(lowStockLimit) || lowStockLimit < 0) {
      setError('Low stock limit must be a non-negative integer.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateProduct(product.id, {
        name: formData.name.trim(),
        category: formData.category.trim(),
        purchasePrice,
        sellingPrice,
        gstRate,
        stockQuantity: product.stockQuantity, // Keep current stock unchanged
        lowStockLimit,
      });

      setLoading(false);

      if (res.success) {
        setSuccessMsg('Product updated successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setError(res.error || 'Failed to update product.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred while updating product.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Product - ${product.name}`}
      subtitle="Modify product details, selling price, purchase price, or low stock limits"
      maxWidth="lg"
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

        <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 flex items-center gap-2.5 text-sky-800 text-xs font-medium">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Current Stock: <strong>{product.stockQuantity} units</strong>. Stock quantity is protected from casual edits. Use the dedicated <strong>Update Stock</strong> action for stock adjustments.
          </span>
        </div>

        <div className="space-y-4">
          <Input
            label="Product Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category *
            </label>
            <input
              name="category"
              list="category-suggestions"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
              required
            />
            <datalist id="category-suggestions">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Purchase Price (₹) *"
              name="purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
            />
            <Input
              label="Selling Price (₹) *"
              name="sellingPrice"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={handleChange}
              required
            />
            <Input
              label="GST Rate (%) *"
              name="gstRate"
              type="number"
              step="0.1"
              value={formData.gstRate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Input
              label="Low Stock Alert Threshold *"
              name="lowStockLimit"
              type="number"
              value={formData.lowStockLimit}
              onChange={handleChange}
              helperText="Status changes to LOW STOCK when inventory drops to or below this quantity"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} icon={<Save className="w-4 h-4" />}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
