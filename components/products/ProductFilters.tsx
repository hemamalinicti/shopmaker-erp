'use client';

import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStockFilter: string; // 'all' | 'low' | 'out' | 'in'
  onStockFilterChange: (value: string) => void;
  categories: string[];
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStockFilter,
  onStockFilterChange,
  categories,
  onResetFilters,
}) => {
  const isFiltered = searchQuery !== '' || selectedCategory !== 'ALL' || selectedStockFilter !== 'all';

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
      {/* Search Input Box */}
      <div className="w-full sm:w-72">
        <Input
          placeholder="Search by product name or category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span>Stock:</span>
          <select
            value={selectedStockFilter}
            onChange={(e) => onStockFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};
