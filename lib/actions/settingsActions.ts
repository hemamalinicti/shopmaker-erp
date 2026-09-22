'use server';

import { prisma } from '@/lib/prisma';
import { shopSettingsSchema } from '@/lib/validations';
import { getDailyProfitLossReport } from '@/lib/actions/reportActions';
import { sendDailyProfitReport } from '@/lib/whatsapp';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

/**
 * Fetches ShopSettings from database with default fallback
 */
export async function getShopSettings() {
  try {
    const settings = await prisma.shopSettings.findFirst();

    if (settings) {
      return {
        id: settings.id,
        shopName: settings.shopName,
        ownerName: settings.ownerName,
        ownerPhone: settings.ownerPhone,
        ownerWhatsAppNumber: settings.ownerWhatsAppNumber || settings.ownerPhone,
        dailyReportEnabled: settings.dailyReportEnabled,
        dailyReportTime: settings.dailyReportTime || '21:00',
        address: settings.address,
        gstNumber: settings.gstNumber || '',
      };
    }

    // Default settings if not created yet
    return {
      id: '',
      shopName: 'ShopMaster General & Electronics Store',
      ownerName: 'Ramesh Kumar',
      ownerPhone: '9876543210',
      ownerWhatsAppNumber: '9876543210',
      dailyReportEnabled: true,
      dailyReportTime: '21:00',
      address: '#45, MG Road, Commercial Complex, Bengaluru, Karnataka 560001',
      gstNumber: '29ABCDE1234F1Z5',
    };
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    return {
      id: '',
      shopName: 'ShopMaster General & Electronics Store',
      ownerName: 'Ramesh Kumar',
      ownerPhone: '9876543210',
      ownerWhatsAppNumber: '9876543210',
      dailyReportEnabled: true,
      dailyReportTime: '21:00',
      address: '#45, MG Road, Commercial Complex, Bengaluru, Karnataka 560001',
      gstNumber: '29ABCDE1234F1Z5',
    };
  }
}

/**
 * Updates ShopSettings and WhatsApp notification configuration. OWNER ONLY.
 */
export async function updateShopSettings(input: unknown) {
  try {
    await requireRole(['OWNER']);
    const validation = shopSettingsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid settings data.',
      };
    }

    const {
      shopName,
      ownerName,
      ownerPhone,
      ownerWhatsAppNumber,
      dailyReportEnabled,
      dailyReportTime,
      address,
      gstNumber,
    } = validation.data;

    const existing = await prisma.shopSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.shopSettings.update({
        where: { id: existing.id },
        data: {
          shopName,
          ownerName,
          ownerPhone,
          ownerWhatsAppNumber: ownerWhatsAppNumber || ownerPhone,
          dailyReportEnabled,
          dailyReportTime: dailyReportTime || '21:00',
          address,
          gstNumber: gstNumber || null,
        },
      });
    } else {
      updated = await prisma.shopSettings.create({
        data: {
          shopName,
          ownerName,
          ownerPhone,
          ownerWhatsAppNumber: ownerWhatsAppNumber || ownerPhone,
          dailyReportEnabled,
          dailyReportTime: dailyReportTime || '21:00',
          address,
          gstNumber: gstNumber || null,
        },
      });
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Shop & WhatsApp settings updated successfully.',
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to update shop settings.',
    };
  }
}

/**
 * Owner Action: Triggers instant test dispatch of daily profit report. OWNER ONLY.
 */
export async function sendTestDailyReport() {
  try {
    await requireRole(['OWNER']);
    const settings = await getShopSettings();
    const ownerPhone = settings.ownerWhatsAppNumber || settings.ownerPhone;

    if (!ownerPhone) {
      return {
        success: false,
        error: 'Owner WhatsApp phone number is not configured in settings.',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const reportData = await getDailyProfitLossReport(todayStr);

    const result = await sendDailyProfitReport(
      settings.ownerName,
      ownerPhone,
      {
        date: reportData.dateString,
        totalSales: reportData.totalSales,
        cogs: reportData.cogs,
        grossProfit: reportData.grossProfit,
        totalExpenses: reportData.totalExpenses,
        netProfit: reportData.netProfit,
        billsCount: reportData.billCount,
        itemsSold: reportData.itemsSold,
      },
      settings.shopName
    );

    return {
      success: result.success,
      mode: result.mode,
      message: result.message,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to send test daily report.',
    };
  }
}
