import { TrackedOrder } from '../types/order';

/**
 * Clean phone number into international format for WhatsApp (e.g. +9647501234567 or 9647501234567)
 */
export function formatPhoneNumberForWhatsApp(phone?: string | null): string {
  if (!phone) return '';
  // Remove spaces, dashes, brackets
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  } else if (cleaned.startsWith('07')) {
    cleaned = '+964' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 10) {
    cleaned = '+964' + cleaned;
  }
  // Remove leading plus for wa.me URL
  return cleaned.replace(/^\+/, '');
}

/**
 * Generate formatted WhatsApp receipt text for Kurdish, Arabic, or English
 */
export function generateWhatsAppReceiptText(
  order: TrackedOrder,
  lang: 'ku' | 'ar' | 'en' = 'ku',
  customerName?: string
): string {
  const isKu = lang === 'ku';
  const isAr = lang === 'ar';

  const orderDate = new Date(order.created_at).toLocaleString(
    isKu ? 'ckb-IQ' : isAr ? 'ar-IQ' : 'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const addressStr = typeof order.address === 'string'
    ? order.address
    : order.address?.street
      ? `${order.address.street}${order.address.district ? `, ${order.address.district}` : ''}${order.address.city ? `, ${order.address.city}` : ''}`
      : order.address?.label || (isKu ? 'هەولێر' : isAr ? 'أربيل' : 'Erbil');

  const storeName = order.business?.name || (isKu ? 'فرۆشگای پلاتفۆرمی شاخ' : isAr ? 'متجر منصة شاخ' : 'SHAKH Store');
  const storePhone = order.business?.phone || '+964 750 000 0000';
  const custName = customerName || (isKu ? 'کڕیاری بەڕێز' : isAr ? 'الزبون المحترم' : 'Valued Customer');

  // Format Items
  const itemsList = order.items && order.items.length > 0
    ? order.items
        .map((it) => `• *${it.quantity}x* ${it.name_ku || it.name_ar || it.name} — ${(it.price * it.quantity).toLocaleString()} IQD`)
        .join('\n')
    : `• 1x ${storeName} Order Package — ${(order.subtotal || order.total - 3000).toLocaleString()} IQD`;

  if (isKu) {
    return `🏔️ *پلاتفۆرمی شاخ (SHAKH) | پسوولەی فەرمی داواکاری*
━━━━━━━━━━━━━━━━━━━━
📋 *ژمارەی وەسل:* \`#${order.order_number}\`
📅 *بەروار و کات:* ${orderDate}

🏬 *زانیاری فرۆشگا:*
• ناو: *${storeName}*
• تەلەفۆن: ${storePhone}

👤 *زانیاری کڕیار:*
• کڕیار: *${custName}*
• ناونیشانی گەیاندن: 📍 ${addressStr}
${order.notes ? `• تێبینی تایبەت: 📝 ${order.notes}\n` : ''}
📦 *لیستی کاڵا و داواکارییەکان:*
${itemsList}

💵 *وردەکاری و پسوولەی پارەدان:*
• نرخی کاڵاکان: ${(order.subtotal || order.total - 3000).toLocaleString()} IQD
• کرێی گەیاندن (دلیڤەری): ${(order.delivery_fee || 3000).toLocaleString()} IQD
• خزمەتگوزاری پلاتفۆرم: ${(order.platform_fee || 500).toLocaleString()} IQD
${order.discount > 0 ? `• داشکاندن: -${order.discount.toLocaleString()} IQD\n` : ''}━━━━━━━━━━━━━━━━━━━━
💰 *کۆی گشتی بۆ پێدان: ${order.total.toLocaleString()} دیناری عێراقی (IQD)*
💳 *شێوازی پارەدان:* ${order.payment_status || 'کاش لە کاتی وەرگرتن (COD)'}
🛵 *دۆخی داواکاری:* ${order.status.replace(/_/g, ' ')}
${order.captain ? `👤 *کاپتنی گەیاندن:* ${order.captain.name} (${order.captain.phone || ''})\n` : ''}
📲 *بەدواداچوونی ڕاستەوخۆ لە پلاتفۆرمی شاخ:*
${typeof window !== 'undefined' ? window.location.origin : 'https://shakh.app'}/orders

✨ *سوپاس بۆ متمانەکردنتان بە پلاتفۆرمی شاخ!*`.trim();
  }

  if (isAr) {
    return `🏔️ *منصة شاخ (SHAKH) | فاتورة الطلب الرسمية*
━━━━━━━━━━━━━━━━━━━━
📋 *رقم الفاتورة:* \`#${order.order_number}\`
📅 *التاريخ والوقت:* ${orderDate}

🏬 *معلومات المتجر:*
• المتجر: *${storeName}*
• هاتف: ${storePhone}

👤 *معلومات الزبون:*
• الاسم: *${custName}*
• عنوان التوصيل: 📍 ${addressStr}
${order.notes ? `• ملاحظات: 📝 ${order.notes}\n` : ''}
📦 *قائمة المنتجات والطلبات:*
${itemsList}

💵 *تفاصيل الدفع والحساب:*
• مجموع المنتجات: ${(order.subtotal || order.total - 3000).toLocaleString()} د.ع
• أجور التوصيل: ${(order.delivery_fee || 3000).toLocaleString()} د.ع
• رسوم المنصة: ${(order.platform_fee || 500).toLocaleString()} د.ع
${order.discount > 0 ? `• خصم: -${order.discount.toLocaleString()} د.ع\n` : ''}━━━━━━━━━━━━━━━━━━━━
💰 *المبلغ الإجمالي للدفع: ${order.total.toLocaleString()} دينار عراقي*
💳 *طريقة الدفع:* ${order.payment_status || 'الدفع عند الاستلام (COD)'}
🛵 *حالة الطلب:* ${order.status.replace(/_/g, ' ')}
${order.captain ? `👤 *كابتن التوصيل:* ${order.captain.name} (${order.captain.phone || ''})\n` : ''}
📲 *تتبع الطلب مباشرة عبر منصة شاخ:*
${typeof window !== 'undefined' ? window.location.origin : 'https://shakh.app'}/orders

✨ *شكراً لاختياركم منصة شاخ!*`.trim();
  }

  // English fallback
  return `🏔️ *SHAKH Platform | Official Order Receipt*
━━━━━━━━━━━━━━━━━━━━
📋 *Receipt No:* \`#${order.order_number}\`
📅 *Date & Time:* ${orderDate}

🏬 *Merchant / Store:*
• Name: *${storeName}*
• Contact: ${storePhone}

👤 *Customer Details:*
• Name: *${custName}*
• Delivery Address: 📍 ${addressStr}
${order.notes ? `• Notes: 📝 ${order.notes}\n` : ''}
📦 *Order Items:*
${itemsList}

💵 *Payment Breakdown:*
• Subtotal: ${(order.subtotal || order.total - 3000).toLocaleString()} IQD
• Delivery Fee: ${(order.delivery_fee || 3000).toLocaleString()} IQD
• Platform Fee: ${(order.platform_fee || 500).toLocaleString()} IQD
${order.discount > 0 ? `• Discount: -${order.discount.toLocaleString()} IQD\n` : ''}━━━━━━━━━━━━━━━━━━━━
💰 *Total Amount Due: ${order.total.toLocaleString()} IQD*
💳 *Payment Method:* ${order.payment_status || 'Cash on Delivery (COD)'}
🛵 *Order Status:* ${order.status.replace(/_/g, ' ')}
${order.captain ? `👤 *Delivery Captain:* ${order.captain.name} (${order.captain.phone || ''})\n` : ''}
📲 *Live Realtime Tracking on SHAKH:*
${typeof window !== 'undefined' ? window.location.origin : 'https://shakh.app'}/orders

✨ *Thank you for ordering with SHAKH Platform!*`.trim();
}

/**
 * Open WhatsApp with the generated receipt
 */
export function sendReceiptViaWhatsApp(
  order: TrackedOrder,
  targetPhoneNumber?: string | null,
  lang: 'ku' | 'ar' | 'en' = 'ku',
  customerName?: string
): void {
  const text = generateWhatsAppReceiptText(order, lang, customerName);
  const encodedText = encodeURIComponent(text);

  const phone = formatPhoneNumberForWhatsApp(targetPhoneNumber);
  const url = phone
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
