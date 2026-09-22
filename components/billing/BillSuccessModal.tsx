'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Printer, Share2, Plus, MessageSquare } from 'lucide-react';
import { generateWhatsAppBillUrl } from '@/lib/whatsapp';

export interface GeneratedBillData {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  profitAmount: number;
  customerName: string;
  customerPhone?: string | null;
  billType: 'GST' | 'NON_GST';
  createdAt: string;
  itemsCount: number;
}

export interface BillSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: GeneratedBillData | null;
  onNewBill: () => void;
}

export const BillSuccessModal: React.FC<BillSuccessModalProps> = ({
  isOpen,
  onClose,
  bill,
  onNewBill,
}) => {
  if (!bill) return null;

  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const whatsAppUrl = bill.customerPhone
    ? generateWhatsAppBillUrl(
        bill.customerPhone,
        {
          invoiceNumber: bill.invoiceNumber,
          customerName: bill.customerName,
          totalAmount: bill.totalAmount,
          billDate: formattedDate,
          itemCount: bill.itemsCount,
        },
        'ShopMaster Store'
      )
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bill Generated Successfully ✓"
      subtitle={`Invoice ${bill.invoiceNumber} has been logged in MySQL database.`}
      maxWidth="md"
    >
      <div className="space-y-5 text-center">
        {/* Success Icon */}
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Bill Key Metrics Box */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400">Invoice Number:</span>
            <span className="font-bold text-white tracking-wide">{bill.invoiceNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400">Customer:</span>
            <span className="font-semibold text-slate-200">{bill.customerName}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400">Bill Type:</span>
            <span className="font-semibold text-slate-200">{bill.billType}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-bold text-slate-300">Total Payable:</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              ₹{bill.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Realized Item Profit:</span>
            <span className="text-emerald-400 font-semibold">+₹{bill.profitAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {/* Print Invoice Button */}
          <Link href={`/billing/${bill.id}`} target="_blank">
            <Button variant="primary" className="w-full" icon={<Printer className="w-4 h-4" />}>
              Print Bill
            </Button>
          </Link>

          {/* WhatsApp Action Button */}
          {whatsAppUrl ? (
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                icon={<MessageSquare className="w-4 h-4 text-emerald-600" />}
              >
                WhatsApp Bill
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" disabled>
              No Customer Phone
            </Button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              onClose();
              onNewBill();
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Start New Bill
          </Button>
        </div>
      </div>
    </Modal>
  );
};
