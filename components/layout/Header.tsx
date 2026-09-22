'use client';

import React from 'react';
import { Menu, Bell, User as UserIcon, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRouter, usePathname } from 'next/navigation';

export interface HeaderProps {
  onMobileMenuToggle?: () => void;
  shopName?: string;
  userName?: string;
  userRole?: 'OWNER' | 'CASHIER';
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  shopName = 'ShopMaster General & Electronics Store',
  userName = 'Ramesh Kumar',
  userRole = 'OWNER',
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewBill = () => {
    if (pathname === '/billing') {
      window.location.href = '/billing';
    } else {
      router.push('/billing');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Left: Mobile Toggle & Shop Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">
            {shopName}
          </h2>
          <span className="text-[11px] text-slate-500 hidden sm:inline-block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions & Profile */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleNewBill}
        >
          New Bill
        </Button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-50 text-brand-700 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border border-brand-200 shrink-0">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{userName}</p>
            <Badge variant={userRole === 'OWNER' ? 'info' : 'neutral'} size="sm" className="mt-0.5">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
