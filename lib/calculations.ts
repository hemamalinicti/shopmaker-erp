/**
 * Core financial & stock calculations for ShopMaster ERP
 */

export interface BillItemInput {
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  gstRate: number;
}

export interface CalculatedBillItem {
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  gstRate: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  profit: number;
}

export interface BillSummary {
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  profitAmount: number;
  cogs: number; // Cost of Goods Sold
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

/**
 * Rounds numbers safely to 2 decimal places for Indian Rupee (INR) transactions.
 */
export function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates profit for a single item unit.
 * Unit Profit = Selling Price - Purchase Price
 */
export function calculateUnitProfit(sellingPrice: number, purchasePrice: number): number {
  return roundToTwoDecimals(sellingPrice - purchasePrice);
}

/**
 * Alias for calculateUnitProfit to clarify potential profit before sale occurs.
 */
export function calculatePotentialUnitProfit(sellingPrice: number, purchasePrice: number): number {
  return calculateUnitProfit(sellingPrice, purchasePrice);
}

/**
 * Calculates total item metrics (subtotal, GST amount, total, profit)
 */
export function calculateBillItem(
  item: BillItemInput,
  billType: 'GST' | 'NON_GST'
): CalculatedBillItem {
  const quantity = Math.max(0, item.quantity);
  const purchasePrice = roundToTwoDecimals(item.purchasePrice);
  const sellingPrice = roundToTwoDecimals(item.sellingPrice);
  const gstRate = billType === 'GST' ? roundToTwoDecimals(item.gstRate) : 0;

  const itemSubtotal = roundToTwoDecimals(sellingPrice * quantity);
  const itemGstAmount = billType === 'GST' 
    ? roundToTwoDecimals((itemSubtotal * gstRate) / 100) 
    : 0;
  const itemTotal = roundToTwoDecimals(itemSubtotal + itemGstAmount);
  
  // Total item profit: (sellingPrice - purchasePrice) * quantity
  const itemProfit = roundToTwoDecimals((sellingPrice - purchasePrice) * quantity);

  return {
    purchasePrice,
    sellingPrice,
    gstRate,
    quantity,
    subtotal: itemSubtotal,
    gstAmount: itemGstAmount,
    total: itemTotal,
    profit: itemProfit,
  };
}

/**
 * Calculates aggregate totals for an entire bill
 */
export function calculateBillTotals(
  items: BillItemInput[],
  billType: 'GST' | 'NON_GST'
): BillSummary {
  let subtotal = 0;
  let gstAmount = 0;
  let totalAmount = 0;
  let profitAmount = 0;
  let cogs = 0;

  items.forEach((item) => {
    const calc = calculateBillItem(item, billType);
    subtotal += calc.subtotal;
    gstAmount += calc.gstAmount;
    totalAmount += calc.total;
    profitAmount += calc.profit;
    cogs += roundToTwoDecimals(calc.purchasePrice * calc.quantity);
  });

  return {
    subtotal: roundToTwoDecimals(subtotal),
    gstAmount: roundToTwoDecimals(gstAmount),
    totalAmount: roundToTwoDecimals(totalAmount),
    profitAmount: roundToTwoDecimals(profitAmount),
    cogs: roundToTwoDecimals(cogs),
  };
}

/**
 * Gross Profit = Total Sales - Cost of Goods Sold (COGS)
 */
export function calculateGrossProfit(totalSales: number, cogs: number): number {
  return roundToTwoDecimals(totalSales - cogs);
}

/**
 * Net Profit = Gross Profit - Total Expenses
 */
export function calculateNetProfit(grossProfit: number, totalExpenses: number): number {
  return roundToTwoDecimals(grossProfit - totalExpenses);
}

/**
 * Checks if product stock is at or below the low stock threshold.
 */
export function isLowStock(stockQuantity: number, lowStockLimit: number): boolean {
  return stockQuantity > 0 && stockQuantity <= lowStockLimit;
}

/**
 * Returns accurate stock status indicator
 */
export function getProductStockStatus(stockQuantity: number, lowStockLimit: number): StockStatus {
  if (stockQuantity <= 0) return 'OUT_OF_STOCK';
  if (stockQuantity <= lowStockLimit) return 'LOW_STOCK';
  return 'IN_STOCK';
}
