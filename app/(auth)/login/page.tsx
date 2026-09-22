'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginAction } from '@/lib/actions/authActions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@shopmaster.in');
  const [password, setPassword] = useState('owner123');
  const [role, setRole] = useState<'OWNER' | 'CASHIER'>('OWNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAction(email, password);
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-brand-600 text-white p-3 rounded-xl shadow-md mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ShopMaster ERP</h1>
          <p className="text-xs text-slate-500 mt-1">
            Retail Shop Management & Billing System
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Demo User</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('OWNER');
                  setEmail('owner@shopmaster.in');
                  setPassword('owner123');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'OWNER'
                    ? 'bg-brand-50 border-brand-600 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('CASHIER');
                  setEmail('cashier1@shopmaster.in');
                  setPassword('cashier123');
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  role === 'CASHIER'
                    ? 'bg-brand-50 border-brand-600 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cashier
              </button>
            </div>
          </div>
          
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@shopmaster.in"
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Signing In...' : `Sign In as ${role}`}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Real Password Verification • BCrypt Active
          </p>
        </div>
      </div>
    </div>
  );
}
