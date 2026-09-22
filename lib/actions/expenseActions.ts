'use server';

import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/lib/validations';
import { roundToTwoDecimals } from '@/lib/calculations';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

export interface ExpenseFilterParams {
  search?: string;
  category?: string;
  date?: string; // YYYY-MM-DD
}

/**
 * Creates a new expense record with server-side validation. OWNER ONLY.
 */
export async function createExpense(input: unknown) {
  try {
    await requireRole(['OWNER']);
    const validation = expenseSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid expense details.',
      };
    }

    const { category, description, amount, expenseDate } = validation.data;
    const parsedDate = expenseDate ? new Date(expenseDate) : new Date();

    const newExpense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: roundToTwoDecimals(amount),
        expenseDate: parsedDate,
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/reports');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Expense recorded successfully.',
      data: newExpense,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to record expense.',
    };
  }
}

/**
 * Updates an existing expense record. OWNER ONLY.
 */
export async function updateExpense(id: string, input: unknown) {
  try {
    await requireRole(['OWNER']);
    const validation = expenseSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid expense details.',
      };
    }

    const { category, description, amount, expenseDate } = validation.data;
    const parsedDate = expenseDate ? new Date(expenseDate) : new Date();

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category,
        description,
        amount: roundToTwoDecimals(amount),
        expenseDate: parsedDate,
      },
    });

    revalidatePath('/expenses');
    revalidatePath('/reports');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Expense updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to update expense.',
    };
  }
}

/**
 * Deletes an expense record. OWNER ONLY.
 */
export async function deleteExpense(id: string) {
  try {
    await requireRole(['OWNER']);
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath('/expenses');
    revalidatePath('/reports');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Expense deleted successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to delete expense.',
    };
  }
}

/**
 * Fetches filtered expenses from database. OWNER ONLY.
 */
export async function getExpenses(params: ExpenseFilterParams = {}) {
  const { search, category, date } = params;

  try {
    await requireRole(['OWNER']);
    const whereClause: any = {};

    if (search && search.trim() !== '') {
      whereClause.description = { contains: search };
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.expenseDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { expenseDate: 'desc' },
    });

    return expenses.map((e) => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      expenseDate: e.expenseDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

/**
 * Fetches expense KPI summary. OWNER ONLY.
 */
export async function getExpenseSummary() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  try {
    await requireRole(['OWNER']);
    const [todayExpenses, monthExpenses] = await Promise.all([
      prisma.expense.findMany({
        where: {
          expenseDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.expense.findMany({
        where: {
          expenseDate: { gte: startOfMonth },
        },
      }),
    ]);

    const todayTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryBreakdown = {
      CURRENT: 0,
      EB: 0,
      SALARY: 0,
      OTHER: 0,
    };

    todayExpenses.forEach((e) => {
      if (categoryBreakdown[e.category] !== undefined) {
        categoryBreakdown[e.category] += Number(e.amount);
      }
    });

    return {
      todayTotal: roundToTwoDecimals(todayTotal),
      monthTotal: roundToTwoDecimals(monthTotal),
      categoryBreakdown: {
        CURRENT: roundToTwoDecimals(categoryBreakdown.CURRENT),
        EB: roundToTwoDecimals(categoryBreakdown.EB),
        SALARY: roundToTwoDecimals(categoryBreakdown.SALARY),
        OTHER: roundToTwoDecimals(categoryBreakdown.OTHER),
      },
    };
  } catch {
    return {
      todayTotal: 0,
      monthTotal: 0,
      categoryBreakdown: {
        CURRENT: 0,
        EB: 0,
        SALARY: 0,
        OTHER: 0,
      },
    };
  }
}
