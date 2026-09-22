'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProduct } from '@/lib/actions/productActions';
import { Package, Plus } from 'lucide-react';

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSuccess?: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mobile Accessories',
    customCategory: '',
    purchasePrice: '',
    sellingPrice: '',
    gstRate: '18',
    stockQuantity: '10',
    lowStockLimit: '5',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const finalCategory =
      formData.category === 'NEW_CATEGORY' ? formData.customCategory : formData.category;

    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const gstRate = parseFloat(formData.gstRate);
    const stockQuantity = parseInt(formData.stockQuantity, 10);
    const lowStockLimit = parseInt(formData.lowStockLimit, 10);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!finalCategory.trim()) {
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
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      setError('Stock quantity must be a non-negative integer.');
      return;
    }
    if (isNaN(lowStockLimit) || lowStockLimit < 0) {
      setError('Low stock limit must be a non-negative integer.');
      return;
    }

    setLoading(true);

    try {
      const res = await createProduct({
        name: formData.name.trim(),
        category: finalCategory.trim(),
        purchasePrice,
        sellingPrice,
        gstRate,
        stockQuantity,
        lowStockLimit,
      });

      setLoading(false);

      if (res.success) {
        setSuccessMsg('Product added successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          setFormData({
            name: '',
            category: categories[0] || 'Mobile Accessories',
            customCategory: '',
            purchasePrice: '',
            sellingPrice: '',
            gstRate: '18',
            stockQuantity: '10',
            lowStockLimit: '5',
          });
          onClose();
          if (onSuccess) onSuccess();
        }, 500);
      } else {
        setError(res.error || 'Failed to add product.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred while adding the product.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product"
      subtitle="Register a new item into inventory with purchase and selling prices"
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

        <div className="space-y-4">
          <Input
            label="Product Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Fast Charging USB Charger 20W"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="NEW_CATEGORY">+ Add New Category</option>
              </select>
            </div>

            {formData.category === 'NEW_CATEGORY' && (
              <Input
                label="Custom Category Name *"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                placeholder="Enter custom category"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Purchase Price (₹) *"
              name="purchasePrice"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={handleChange}
              placeholder="e.g. 250"
              required
            />
            <Input
              label="Selling Price (₹) *"
              name="sellingPrice"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="e.g. 499"
              required
            />
            <Input
              label="GST Rate (%) *"
              name="gstRate"
              type="number"
              step="0.1"
              value={formData.gstRate}
              onChange={handleChange}
              placeholder="18"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Initial Stock Quantity *"
              name="stockQuantity"
              type="number"
              value={formData.stockQuantity}
              onChange={handleChange}
              placeholder="10"
              required
            />
            <Input
              label="Low Stock Alert Threshold *"
              name="lowStockLimit"
              type="number"
              value={formData.lowStockLimit}
              onChange={handleChange}
              placeholder="5"
              helperText="Alert badge will display when stock reaches this limit"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} icon={<Plus className="w-4 h-4" />}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
