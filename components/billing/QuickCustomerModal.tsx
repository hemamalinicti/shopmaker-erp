'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCustomerQuick } from '@/lib/actions/billActions';
import { UserPlus } from 'lucide-react';

export interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer: { id: string; name: string; phone: string }) => void;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!/^[0-9]{10,12}$/.test(phone.trim())) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await createCustomerQuick({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });

      setLoading(false);

      if (res.success && res.data) {
        setName('');
        setPhone('');
        setEmail('');
        onClose();
        onSuccess(res.data);
      } else {
        setError(res.error || 'Failed to add customer.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      subtitle="Register customer details for WhatsApp bill sharing"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Customer Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Anish Kumar"
          required
        />

        <Input
          label="Phone Number (WhatsApp) *"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10-digit mobile number e.g. 9876543210"
          required
        />

        <Input
          label="Email Address (Optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="anish@example.com"
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading} icon={<UserPlus className="w-4 h-4" />}>
            {loading ? 'Adding...' : 'Save & Select Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
