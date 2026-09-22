'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Store,
  LogOut,
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/authActions';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'CASHIER'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['OWNER', 'CASHIER'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['OWNER'] },
  { name: 'Expenses', href: '/expenses', icon: Wallet, roles: ['OWNER'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['OWNER'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['OWNER', 'CASHIER'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['OWNER'] },
];

export interface SidebarProps {
  userRole?: 'OWNER' | 'CASHIER';
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'OWNER' }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
        <div className="bg-brand-600 text-white p-2 rounded-lg shrink-0">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight">ShopMaster</h1>
          <p className="text-[11px] text-slate-400 font-medium">Retail ERP</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer / Logout Link */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
