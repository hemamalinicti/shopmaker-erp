'use server';

import { prisma } from '@/lib/prisma';
import { roundToTwoDecimals, calculateGrossProfit, calculateNetProfit } from '@/lib/calculations';
import { requireRole } from '@/lib/auth';

export interface ProductProfitSummaryItem {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  totalSales: number;
  totalCost: number;
  realizedProfit: number;
}

export interface DailyReportData {
  dateString: string;
  totalSales: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  billCount: number;
  itemsSold: number;
  expenseBreakdown: {
    CURRENT: number;
    EB: number;
    SALARY: number;
    OTHER: number;
  };
  productProfitSummary: ProductProfitSummaryItem[];
}

/**
 * Single source of truth for Daily Profit & Loss report computation. OWNER ONLY.
 * Handles target date in Indian Standard Time (IST) local day bounds.
 */
export async function getDailyProfitLossReport(
  targetDateString?: string,
  options?: { skipRoleCheck?: boolean }
): Promise<DailyReportData> {
  const targetDate = targetDateString ? new Date(targetDateString) : new Date();

  // Local Day Boundaries
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  const displayDateStr = startOfDay.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  try {
    if (!options?.skipRoleCheck) {
      await requireRole(['OWNER']);
    }

    // 1. Fetch Bills for Target Date
    const bills = await prisma.bill.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        billItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // 2. Fetch Expenses for Target Date
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 3. Compute Total Sales Revenue
    const totalSales = roundToTwoDecimals(
      bills.reduce((sum, b) => sum + Number(b.totalAmount), 0)
    );

    // 4. Compute Cost of Goods Sold (COGS) & Total Items Sold using BillItem historical price snapshots
    let cogs = 0;
    let itemsSold = 0;
    const productMap = new Map<string, ProductProfitSummaryItem>();

    bills.forEach((b) => {
      b.billItems.forEach((item) => {
        const qty = item.quantity;
        const purchasePrice = Number(item.purchasePrice);
        const sellingPrice = Number(item.sellingPrice);
        const itemCost = purchasePrice * qty;
        const itemSales = sellingPrice * qty;
        const itemProfit = Number(item.profit);

        cogs += itemCost;
        itemsSold += qty;

        const existing = productMap.get(item.productId);
        const pName = item.product ? item.product.name : 'Unknown Product';
        const pCat = item.product ? item.product.category : 'General';

        if (existing) {
          existing.quantitySold += qty;
          existing.totalSales += itemSales;
          existing.totalCost += itemCost;
          existing.realizedProfit += itemProfit;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: pName,
            category: pCat,
            quantitySold: qty,
            totalSales: itemSales,
            totalCost: itemCost,
            realizedProfit: itemProfit,
          });
        }
      });
    });

    cogs = roundToTwoDecimals(cogs);

    // 5. Compute Gross Profit = Total Sales - Cost of Goods Sold (COGS)
    const grossProfit = calculateGrossProfit(totalSales, cogs);

    // 6. Compute Total Operating Expenses & Category Breakdown
    const expenseBreakdown = {
      CURRENT: 0,
      EB: 0,
      SALARY: 0,
      OTHER: 0,
    };

    let totalExpenses = 0;
    expenses.forEach((e) => {
      const amt = Number(e.amount);
      totalExpenses += amt;
      if (expenseBreakdown[e.category] !== undefined) {
        expenseBreakdown[e.category] += amt;
      }
    });

    totalExpenses = roundToTwoDecimals(totalExpenses);

    // 7. Compute Net Profit = Gross Profit - Total Expenses
    const netProfit = calculateNetProfit(grossProfit, totalExpenses);

    const productProfitSummary = Array.from(productMap.values()).map((p) => ({
      ...p,
      totalSales: roundToTwoDecimals(p.totalSales),
      totalCost: roundToTwoDecimals(p.totalCost),
      realizedProfit: roundToTwoDecimals(p.realizedProfit),
    }));

    return {
      dateString: displayDateStr,
      totalSales,
      cogs,
      grossProfit,
      totalExpenses,
      netProfit,
      billCount: bills.length,
      itemsSold,
      expenseBreakdown: {
        CURRENT: roundToTwoDecimals(expenseBreakdown.CURRENT),
        EB: roundToTwoDecimals(expenseBreakdown.EB),
        SALARY: roundToTwoDecimals(expenseBreakdown.SALARY),
        OTHER: roundToTwoDecimals(expenseBreakdown.OTHER),
      },
      productProfitSummary,
    };
  } catch (error) {
    console.error('Error calculating daily profit/loss report:', error);
    return {
      dateString: displayDateStr,
      totalSales: 0,
      cogs: 0,
      grossProfit: 0,
      totalExpenses: 0,
      netProfit: 0,
      billCount: 0,
      itemsSold: 0,
      expenseBreakdown: {
        CURRENT: 0,
        EB: 0,
        SALARY: 0,
        OTHER: 0,
      },
      productProfitSummary: [],
    };
  }
}
