export type Role = 'OWNER' | 'CASHIER';
export type BillType = 'GST' | 'NON_GST';
export type ExpenseCategory = 'CURRENT' | 'EB' | 'SALARY' | 'OTHER';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}

export interface ShopSettingsDTO {
  id: string;
  shopName: string;
  ownerName: string;
  ownerPhone: string;
  address: string;
  gstNumber?: string | null;
}

export interface ProductDTO {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stockQuantity: number;
  lowStockLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDTO {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  createdAt: string;
}

export interface BillItemDTO {
  id: string;
  billId: string;
  productId: string;
  productName?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  total: number;
  profit: number;
}

export interface BillDTO {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  billType: BillType;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  profitAmount: number;
  createdAt: string;
  billItems: BillItemDTO[];
}

export interface ExpenseDTO {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
}

export interface DashboardMetrics {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  lowStockCount: number;
  recentBillsCount: number;
}
