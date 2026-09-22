'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Package, AlertCircle } from 'lucide-react';
import { getProducts } from '@/lib/actions/productActions';

export interface ProductSearchResult {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stockQuantity: number;
  lowStockLimit: number;
}

export interface ProductSearchBoxProps {
  onSelectProduct: (product: ProductSearchResult) => void;
}

export const ProductSearchBox: React.FC<ProductSearchBoxProps> = ({ onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const products = await getProducts({ search: query });
        setResults(products);
        setIsOpen(true);
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: ProductSearchResult) => {
    if (product.stockQuantity <= 0) return;
    onSelectProduct(product);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search products by name or category to add to bill..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 shadow-xs"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto z-30 divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No active products found matching &quot;{query}&quot;.
            </div>
          ) : (
            results.map((product) => {
              const isOut = product.stockQuantity <= 0;
              const isLow = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockLimit;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={`p-3 flex items-center justify-between transition-colors ${
                    isOut
                      ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'hover:bg-brand-50/50 cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>GST: {product.gstRate}%</span>
                      <span
                        className={
                          isOut
                            ? 'text-red-600 font-bold'
                            : isLow
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-700 font-semibold'
                        }
                      >
                        {isOut ? 'Out of Stock' : `Stock: ${product.stockQuantity} units`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{product.sellingPrice.toFixed(2)}
                    </span>
                    {!isOut ? (
                      <span className="bg-brand-600 text-white p-1.5 rounded-lg hover:bg-brand-700">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-red-600 text-[10px] font-bold">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
