import React from 'react';
import { notFound } from 'next/navigation';
import { getBillById } from '@/lib/actions/billActions';
import { PrintableInvoice } from '@/components/billing/PrintableInvoice';

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoiceDetailPage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getBillById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="py-4">
      <PrintableInvoice invoice={invoice} />
    </div>
  );
}
