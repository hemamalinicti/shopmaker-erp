'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Search, Phone } from 'lucide-react';
import { getCustomers } from '@/lib/actions/billActions';
import { Button } from '@/components/ui/Button';

export interface CustomerOption {
  id: string;
  name: string;
  phone: string;
}

export interface CustomerSelectBoxProps {
  selectedCustomer: CustomerOption | null;
  onSelectCustomer: (customer: CustomerOption | null) => void;
  onOpenQuickAddCustomer: () => void;
}

export const CustomerSelectBox: React.FC<CustomerSelectBoxProps> = ({
  selectedCustomer,
  onSelectCustomer,
  onOpenQuickAddCustomer,
}) => {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        const list = await getCustomers(query);
        setCustomers(list);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };
    fetchCustomersList();
  }, [query]);

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-brand-600" /> Customer Information
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenQuickAddCustomer}
          icon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add New Customer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => onSelectCustomer(null)}
          className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
            selectedCustomer === null
              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Walk-in Customer (General)
        </button>

        <div className="flex-1 relative">
          <select
            value={selectedCustomer ? selectedCustomer.id : ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                onSelectCustomer(null);
              } else {
                const found = customers.find((c) => c.id === val);
                if (found) onSelectCustomer(found);
              }
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="">-- Select Existing Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCustomer && (
        <div className="p-2.5 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-between text-xs text-brand-900">
          <div>
            <span className="font-bold">{selectedCustomer.name}</span>
            <span className="text-slate-500 font-mono text-[11px] ml-2">({selectedCustomer.phone})</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectCustomer(null)}
            className="text-brand-700 hover:text-brand-900 text-[11px] font-semibold underline"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};
