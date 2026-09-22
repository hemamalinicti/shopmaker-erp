'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Receipt, Plus, History, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductSearchBox, ProductSearchResult } from '@/components/billing/ProductSearchBox';
import { CustomerSelectBox, CustomerOption } from '@/components/billing/CustomerSelectBox';
import { CartTable, CartItem } from '@/components/billing/CartTable';
import { BillSuccessModal, GeneratedBillData } from '@/components/billing/BillSuccessModal';
import { QuickCustomerModal } from '@/components/billing/QuickCustomerModal';
import { createBill } from '@/lib/actions/billActions';
import { roundToTwoDecimals } from '@/lib/calculations';

export default function BillingPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [billType, setBillType] = useState<'GST' | 'NON_GST'>('GST');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedBill, setGeneratedBill] = useState<GeneratedBillData | null>(null);

  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);

  // Add Product to Cart
  const handleSelectProduct = (product: ProductSearchResult) => {
    setError('');
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (existing.quantity >= product.stockQuantity) {
          setError(`Cannot add more than available stock (${product.stockQuantity} units).`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          quantity: existing.quantity + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          gstRate: product.gstRate,
          stockQuantity: product.stockQuantity,
          quantity: 1,
        },
      ];
    });
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (productId: string, newQty: number) => {
    setError('');
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const clamped = Math.max(1, Math.min(newQty, item.stockQuantity));
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  // Remove Cart Item
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
    setError('');
  };

  // Real-time calculations for preview
  const subtotal = roundToTwoDecimals(
    cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  );
  const gstAmount = roundToTwoDecimals(
    cartItems.reduce((sum, item) => {
      const itemSub = item.sellingPrice * item.quantity;
      return sum + (billType === 'GST' ? (itemSub * item.gstRate) / 100 : 0);
    }, 0)
  );
  const grandTotal = roundToTwoDecimals(subtotal + gstAmount);
  const totalProfit = roundToTwoDecimals(
    cartItems.reduce(
      (sum, item) => sum + (item.sellingPrice - item.purchasePrice) * item.quantity,
      0
    )
  );

  // Submit Bill Generation
  const handleGenerateBill = async () => {
    setError('');

    if (cartItems.length === 0) {
      setError('Billing cart is empty. Add products before generating a bill.');
      return;
    }

    setLoading(true);

    try {
      const res = await createBill({
        customerId: selectedCustomer ? selectedCustomer.id : undefined,
        billType,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      setLoading(false);

      if (res.success && res.data) {
        setGeneratedBill(res.data);
      } else {
        setError(res.error || 'Failed to generate bill.');
      }
    } catch {
      setLoading(false);
      setError('An unexpected transaction error occurred.');
    }
  };

  const handleResetForNewBill = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setBillType('GST');
    setError('');
    setGeneratedBill(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" /> Billing Counter
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Create GST & Non-GST sales bills with atomic stock deduction & price snapshotting
          </p>
        </div>
        <Link href="/billing/history">
          <Button variant="outline" icon={<History className="w-4 h-4" />}>
            Bill History
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Cashier Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Search, Customer & Cart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Selection */}
          <CustomerSelectBox
            selectedCustomer={selectedCustomer}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onOpenQuickAddCustomer={() => setIsQuickCustomerModalOpen(true)}
          />

          {/* Product Search */}
          <ProductSearchBox onSelectProduct={handleSelectProduct} />

          {/* Cart Table */}
          <CartTable
            items={cartItems}
            billType={billType}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />
        </div>

        {/* Right 1 Column: Bill Type & Totals Summary */}
        <div className="space-y-4">
          <Card title="Billing Config & Summary">
            {/* Bill Type Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Bill Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillType('GST')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    billType === 'GST'
                      ? 'bg-brand-50 border-brand-600 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  GST Bill
                </button>
                <button
                  type="button"
                  onClick={() => setBillType('NON_GST')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    billType === 'NON_GST'
                      ? 'bg-brand-50 border-brand-600 text-brand-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Non-GST Bill
                </button>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Count:</span>
                <span className="font-semibold text-slate-900">{cartItems.length} items</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax Amount:</span>
                <span className="font-semibold text-slate-900">
                  {billType === 'GST' ? `₹${gstAmount.toFixed(2)}` : '₹0.00 (Exempt)'}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable:</span>
                <span className="text-2xl font-extrabold text-brand-700">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 flex justify-between">
                <span>Estimated Profit:</span>
                <span>+₹{totalProfit.toFixed(2)}</span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full mt-4 py-3"
                onClick={handleGenerateBill}
                disabled={loading || cartItems.length === 0}
                icon={<CheckCircle2 className="w-5 h-5" />}
              >
                {loading ? 'Processing Bill...' : 'Generate & Complete Bill'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Customer Add Modal */}
      <QuickCustomerModal
        isOpen={isQuickCustomerModalOpen}
        onClose={() => setIsQuickCustomerModalOpen(false)}
        onSuccess={(newCust) => setSelectedCustomer(newCust)}
      />

      {/* Bill Success Modal */}
      <BillSuccessModal
        isOpen={Boolean(generatedBill)}
        onClose={() => setGeneratedBill(null)}
        bill={generatedBill}
        onNewBill={handleResetForNewBill}
      />
    </div>
  );
}
