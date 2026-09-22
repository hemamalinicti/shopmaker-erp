'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { UserSession } from '@/lib/auth';

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: UserSession | null;
}

export const DashboardClientLayout: React.FC<DashboardClientLayoutProps> = ({
  children,
  user,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = user?.name || 'Store User';
  const userRole = user?.role || 'OWNER';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar userRole={userRole} />
      </div>

      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          userName={userName}
          userRole={userRole}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
