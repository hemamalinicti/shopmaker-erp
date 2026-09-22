import React from 'react';
import { getSession } from '@/lib/auth';
import { DashboardClientLayout } from '@/components/layout/DashboardClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <DashboardClientLayout user={session}>
      {children}
    </DashboardClientLayout>
  );
}
