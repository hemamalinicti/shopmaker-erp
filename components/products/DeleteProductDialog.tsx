'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { deleteProduct } from '@/lib/actions/productActions';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
  } | null;
  onSuccess?: () => void;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await deleteProduct(product.id);
      setLoading(false);

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to delete product.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred while deleting product.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Product"
      subtitle="Confirm product removal or archiving"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900 text-sm">
              Are you sure you want to delete &quot;{product.name}&quot;?
            </p>
            <p className="text-slate-600 leading-relaxed">
              If this product was previously sold on bills, it will be safely archived (`isActive = false`) to preserve historical invoice data and profit reports.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            icon={<Trash2 className="w-4 h-4" />}
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
