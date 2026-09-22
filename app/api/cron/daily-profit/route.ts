import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getShopSettings } from '@/lib/actions/settingsActions';
import { getDailyProfitLossReport } from '@/lib/actions/reportActions';
import { sendDailyProfitReport } from '@/lib/whatsapp';

/**
 * Helper to compute current IST date string (YYYY-MM-DD)
 */
function getISTDateString(): string {
  const now = new Date();
  // Adjust to IST timezone offset (+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    // 1. Cron Security Validation
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');

    const cronSecret = process.env.CRON_SECRET || process.env.WHATSAPP_CRON_SECRET || 'dev_cron_secret';
    const providedSecret = authHeader ? authHeader.replace('Bearer ', '') : querySecret;

    if (providedSecret !== cronSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
    }

    // 2. Fetch Shop Settings & Report Config
    const settings = await getShopSettings();

    if (!settings.dailyReportEnabled) {
      return NextResponse.json({
        success: true,
        message: 'Daily WhatsApp report is currently disabled in ShopSettings.',
      });
    }

    const recipientPhone = settings.ownerWhatsAppNumber || settings.ownerPhone;
    if (!recipientPhone) {
      return NextResponse.json({
        success: false,
        message: 'Owner WhatsApp phone number is not configured in settings.',
      });
    }

    // 3. Determine IST Business Date & Duplicate Check
    const istDateStr = getISTDateString();

    try {
      const existingLog = await prisma.dailyReportLog.findUnique({
        where: { reportDate: istDateStr },
      });

      if (existingLog && (existingLog.status === 'SENT' || existingLog.status === 'SIMULATED')) {
        return NextResponse.json({
          success: true,
          message: `Daily report already processed for IST date ${istDateStr}. Skipping duplicate dispatch.`,
          log: existingLog,
        });
      }
    } catch {
      // Database log table notice fallback
    }

    // 4. Generate Single Source of Truth Daily P&L Report
    const reportData = await getDailyProfitLossReport(istDateStr, { skipRoleCheck: true });

    // 5. Send Report via WhatsApp Service
    const dispatchResult = await sendDailyProfitReport(
      settings.ownerName,
      recipientPhone,
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

    // 6. Log Transaction Execution in Database
    try {
      await prisma.dailyReportLog.upsert({
        where: { reportDate: istDateStr },
        update: {
          status: dispatchResult.mode,
          messageId: dispatchResult.messageId || null,
          details: dispatchResult.message,
          sentAt: new Date(),
        },
        create: {
          reportDate: istDateStr,
          status: dispatchResult.mode,
          messageId: dispatchResult.messageId || null,
          details: dispatchResult.message,
        },
      });
    } catch (logErr) {
      console.error('Notice: Could not write to DailyReportLog:', logErr);
    }

    return NextResponse.json({
      success: dispatchResult.success,
      date: istDateStr,
      mode: dispatchResult.mode,
      recipient: recipientPhone,
      message: dispatchResult.message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Daily cron execution failed.' },
      { status: 500 }
    );
  }
}
