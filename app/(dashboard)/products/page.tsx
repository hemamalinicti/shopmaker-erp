'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductTable, ProductItem } from '@/components/products/ProductTable';
import { ProductFilters } from '@/components/products/ProductFilters';
import { AddProductModal } from '@/components/products/AddProductModal';
import { EditProductModal } from '@/components/products/EditProductModal';
import { StockAdjustModal } from '@/components/products/StockAdjustModal';
import { ProductDetailsModal } from '@/components/products/ProductDetailsModal';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { getProducts, getProductCategories } from '@/lib/actions/productActions';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const stockParam = searchParams?.get('stock') || 'all';
  const searchParam = searchParams?.get('search') || '';
  const categoryParam = searchParams?.get('category') || 'ALL';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedStockFilter, setSelectedStockFilter] = useState(stockParam);

  // Modal active states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<ProductItem | null>(null);
  const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  const fetchProductsData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedCats] = await Promise.all([
        getProducts({
          search: searchQuery,
          category: selectedCategory,
          stockStatus: selectedStockFilter,
        }),
        getProductCategories(),
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStockFilter]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  // Sync state changes to URL query
  const updateUrlParams = (newSearch: string, newCat: string, newStock: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCat && newCat !== 'ALL') params.set('category', newCat);
    if (newStock && newStock !== 'all') params.set('stock', newStock);

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : '/products');
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(val, selectedCategory, selectedStockFilter);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    updateUrlParams(searchQuery, val, selectedStockFilter);
  };

  const handleStockFilterChange = (val: string) => {
    setSelectedStockFilter(val);
    updateUrlParams(searchQuery, selectedCategory, val);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStockFilter('all');
    router.push('/products');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" /> Products & Inventory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Manage purchase prices, selling prices, GST rates, and low-stock alerts
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>

      {/* Filter Bar */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedStockFilter={selectedStockFilter}
        onStockFilterChange={handleStockFilterChange}
        categories={categories}
        onResetFilters={handleResetFilters}
      />

      {/* Main Products Data Table */}
      <ProductTable
        products={products}
        loading={loading}
        onView={(p) => setViewingProduct(p)}
        onEdit={(p) => setEditingProduct(p)}
        onStockAdjust={(p) => setStockAdjustProduct(p)}
        onDelete={(p) => setDeletingProduct(p)}
      />

      {/* Dialog Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onSuccess={fetchProductsData}
      />

      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories}
        onSuccess={fetchProductsData}
      />

      <StockAdjustModal
        isOpen={Boolean(stockAdjustProduct)}
        onClose={() => setStockAdjustProduct(null)}
        product={stockAdjustProduct}
        onSuccess={fetchProductsData}
      />

      <ProductDetailsModal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEditClick={() => {
          const target = viewingProduct;
          setViewingProduct(null);
          setEditingProduct(target);
        }}
        onStockAdjustClick={() => {
          const target = viewingProduct;
          setViewingProduct(null);
          setStockAdjustProduct(target);
        }}
      />

      <DeleteProductDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        product={deletingProduct}
        onSuccess={fetchProductsData}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Loading product module...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
