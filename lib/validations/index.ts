import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  gstRate: z.number().min(0, 'GST rate cannot be negative').max(100, 'Invalid GST rate'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be 0 or greater'),
  lowStockLimit: z.number().int().min(0, 'Low stock limit must be 0 or greater'),
});

export const stockUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityChange: z.number().int('Quantity change must be an integer'),
  reason: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().regex(/^[0-9]{10,12}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const expenseSchema = z.object({
  category: z.enum(['CURRENT', 'EB', 'SALARY', 'OTHER']),
  description: z.string().min(2, 'Description is required'),
  amount: z.number().positive('Expense amount must be greater than zero'),
  expenseDate: z.string().optional(),
});

export const billItemInputSchema = z.object({
  productId: z.string().min(1, 'Product selection required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createBillSchema = z.object({
  customerId: z.string().optional(),
  billType: z.enum(['GST', 'NON_GST']),
  items: z.array(billItemInputSchema).min(1, 'At least one item is required in the bill'),
});

export const shopSettingsSchema = z.object({
  shopName: z.string().min(2, 'Shop name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerPhone: z.string().regex(/^[0-9]{10,12}$/, 'Enter a valid 10-digit owner phone number'),
  ownerWhatsAppNumber: z
    .string()
    .regex(/^[0-9]{10,12}$/, 'Enter a valid 10-digit WhatsApp number')
    .optional()
    .or(z.literal('')),
  dailyReportEnabled: z.boolean(),
  dailyReportTime: z.string().default('21:00'),
  address: z.string().min(5, 'Address is required'),
  gstNumber: z.string().optional().or(z.literal('')),
});
