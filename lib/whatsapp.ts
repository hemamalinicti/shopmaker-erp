/**
 * WhatsApp Module for ShopMaster ERP
 * Feature A: Customer Bill URL Link Generator (Client/Web)
 * Feature B: Owner Automated Daily 9 PM Profit Report Provider Integration
 */

export interface WhatsAppBillDetails {
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  billDate: string;
  itemCount: number;
}

export interface WhatsAppDailyReportDetails {
  date: string;
  totalSales: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  billsCount: number;
  itemsSold: number;
}

/**
 * Sanitizes phone numbers for WhatsApp links/API (strips non-digits, ensures country code).
 */
export function formatPhoneNumberForWhatsApp(phone: string, defaultCountryCode = '91'): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${defaultCountryCode}${cleaned}`;
  }
  return cleaned;
}

/**
 * FEATURE A: Customer Bill Direct WhatsApp Link Generator
 * Used on cashier success screen & bill history.
 */
export function generateWhatsAppBillUrl(
  customerPhone: string,
  details: WhatsAppBillDetails,
  shopName: string = 'ShopMaster Store'
): string {
  const formattedPhone = formatPhoneNumberForWhatsApp(customerPhone);
  const message = `Hello ${details.customerName},\n\nThank you for shopping at *${shopName}*!\n\n*Invoice No:* ${details.invoiceNumber}\n*Date:* ${details.billDate}\n*Items:* ${details.itemCount}\n*Total Amount:* ₹${details.totalAmount.toFixed(2)}\n\nHave a great day!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * FEATURE B: Formats Daily Financial Summary Message for Shop Owner
 */
export function generateDailyProfitMessage(
  shopOwnerName: string,
  details: WhatsAppDailyReportDetails,
  shopName: string = 'ShopMaster Store'
): string {
  return `*${shopName} Daily Report*\nOwner: ${shopOwnerName}\n📅 ${details.date}\n\nSales: ₹${details.totalSales.toFixed(2)}\nCOGS: ₹${details.cogs.toFixed(2)}\nGross Profit: ₹${details.grossProfit.toFixed(2)}\nExpenses: ₹${details.totalExpenses.toFixed(2)}\n\n💰 *Net Profit: ₹${details.netProfit.toFixed(2)}*\n\nBills Generated: ${details.billsCount}\nItems Sold: ${details.itemsSold}\n\nThank you.`;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  mode: 'SENT' | 'FAILED' | 'SIMULATED';
  messageId?: string;
  message: string;
}

/**
 * FEATURE B: Server-side Dispatcher for Owner Daily Report
 * Calls WhatsApp Provider API if environment credentials exist;
 * otherwise executes in SIMULATED / DEV TEST MODE.
 */
export async function sendDailyProfitReport(
  ownerName: string,
  recipientPhone: string,
  details: WhatsAppDailyReportDetails,
  shopName: string = 'ShopMaster Store'
): Promise<WhatsAppDispatchResult> {
  const formattedPhone = formatPhoneNumberForWhatsApp(recipientPhone);
  const formattedMessage = generateDailyProfitMessage(ownerName, details, shopName);

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl || !apiToken || apiUrl.includes('example') || apiToken.includes('dev_')) {
    // Development / Simulated Mode
    console.log('\n--------------------------------------------------');
    console.log('[WHATSAPP SIMULATED MODE - OWNER DAILY REPORT]');
    console.log(`Recipient Phone: +${formattedPhone}`);
    console.log('Message Payload:\n' + formattedMessage);
    console.log('--------------------------------------------------\n');

    return {
      success: true,
      mode: 'SIMULATED',
      messageId: `sim_${Date.now()}`,
      message: `Simulated mode: Report formatted and logged for +${formattedPhone}. (External provider API credentials not set in .env)`,
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: formattedMessage },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        mode: 'FAILED',
        message: `WhatsApp API Provider Error (${response.status}): ${errorText.slice(0, 100)}`,
      };
    }

    const json = await response.json();
    return {
      success: true,
      mode: 'SENT',
      messageId: json?.messages?.[0]?.id || `api_${Date.now()}`,
      message: `Report successfully dispatched to +${formattedPhone} via WhatsApp API.`,
    };
  } catch (err: any) {
    return {
      success: false,
      mode: 'FAILED',
      message: err?.message || 'Failed to communicate with WhatsApp API Provider.',
    };
  }
}
