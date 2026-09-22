import React from 'react';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage customer records for instant WhatsApp bill sharing and repeat sales tracking
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Phone Number</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-900">Vikram Singh</td>
                <td className="py-3 px-3 font-mono text-slate-800">9123456780</td>
                <td className="py-3 px-3 text-slate-500">vikram@example.com</td>
                <td className="py-3 px-3 text-center">
                  <button className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-900">Priya Sundaram</td>
                <td className="py-3 px-3 font-mono text-slate-800">9876501234</td>
                <td className="py-3 px-3 text-slate-500">priya@example.com</td>
                <td className="py-3 px-3 text-center">
                  <button className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
