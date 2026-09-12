import { Post, SocialPlatform } from '../types/post';

export interface ShareResult {
  success: boolean;
  platform: SocialPlatform;
  message?: string;
}

/**
 * Generate formatted share message for social media
 */
export function generatePostShareMessage(
  post: Post,
  lang: 'ku' | 'ar' | 'en' = 'ku'
): { title: string; text: string; url: string } {
  const isKu = lang === 'ku';
  const isAr = lang === 'ar';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shakh.app';
  const url = `${baseUrl}/?post=${post.id}`;

  const storeName = post.author.name;
  const content = (isKu ? post.content_ku : isAr ? post.content_ar : post.content_en) || post.content;
  const cleanSnippet = content.length > 120 ? `${content.substring(0, 117)}...` : content;

  let title = '';
  let text = '';

  if (isKu) {
    title = `${post.author.name} لە پلاتفۆرمی شاخ`;
    text = `🏔️ *پلاتفۆرمی شاخ (SHAKH)*
📢 *${storeName}*:
"${cleanSnippet}"

${post.product ? `🏷️ نرخ: ${post.product.price.toLocaleString()} IQD\n` : ''}${post.deal ? `🔥 داشکاندن: ${post.deal.discount_label}\n` : ''}
🔗 بینین و داواکردنی ڕاستەوخۆ:
${url}`;
  } else if (isAr) {
    title = `${post.author.name} على منصة شاخ`;
    text = `🏔️ *منصة شاخ (SHAKH)*
📢 *${storeName}*:
"${cleanSnippet}"

${post.product ? `🏷️ السعر: ${post.product.price.toLocaleString()} د.ع\n` : ''}${post.deal ? `🔥 العرض: ${post.deal.discount_label}\n` : ''}
🔗 شاهد واطلب مباشرة عبر شاخ:
${url}`;
  } else {
    title = `${post.author.name} on SHAKH Platform`;
    text = `🏔️ *SHAKH Platform*
📢 *${storeName}*:
"${cleanSnippet}"

${post.product ? `🏷️ Price: ${post.product.price.toLocaleString()} IQD\n` : ''}${post.deal ? `🔥 Offer: ${post.deal.discount_label}\n` : ''}
🔗 View & Order directly on SHAKH:
${url}`;
  }

  return { title, text, url };
}

/**
 * Share a post to specific social media platform or web share
 */
export async function sharePostToPlatform(
  post: Post,
  platform: SocialPlatform,
  lang: 'ku' | 'ar' | 'en' = 'ku'
): Promise<ShareResult> {
  const { title, text, url } = generatePostShareMessage(post, lang);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  try {
    switch (platform) {
      case 'whatsapp': {
        const waUrl = `https://wa.me/?text=${encodedText}`;
        if (typeof window !== 'undefined') window.open(waUrl, '_blank', 'noopener,noreferrer');
        return { success: true, platform };
      }

      case 'facebook': {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        if (typeof window !== 'undefined') window.open(fbUrl, '_blank', 'noopener,noreferrer');
        return { success: true, platform };
      }

      case 'telegram': {
        const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        if (typeof window !== 'undefined') window.open(tgUrl, '_blank', 'noopener,noreferrer');
        return { success: true, platform };
      }

      case 'viber': {
        const viberUrl = `viber://forward?text=${encodedText}`;
        if (typeof window !== 'undefined') {
          // Fallback if desktop doesn't handle viber protocol
          window.location.href = viberUrl;
        }
        return { success: true, platform };
      }

      case 'x': {
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.substring(0, 240))}&url=${encodedUrl}`;
        if (typeof window !== 'undefined') window.open(xUrl, '_blank', 'noopener,noreferrer');
        return { success: true, platform };
      }

      case 'messenger': {
        const messengerUrl = `fb-messenger://share/?link=${encodedUrl}`;
        if (typeof window !== 'undefined') window.open(messengerUrl, '_blank', 'noopener,noreferrer');
        return { success: true, platform };
      }

      case 'instagram': {
        // Copy text and open Instagram web/app
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        }
        if (typeof window !== 'undefined') {
          window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
        }
        return {
          success: true,
          platform,
          message: lang === 'ku' ? 'دەقەکە کۆپیکرا و ئینستاگرم کرایەوە' : 'Copied caption for Instagram',
        };
      }

      case 'native_share': {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title,
            text,
            url,
          });
          return { success: true, platform };
        }
        // Fallback to clipboard
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(`${text}\n${url}`);
          return { success: true, platform: 'copy_link' };
        }
        return { success: false, platform };
      }

      case 'copy_link':
      default: {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          return { success: true, platform: 'copy_link' };
        }
        return { success: false, platform: 'copy_link' };
      }
    }
  } catch (err) {
    console.error('Share action failed:', err);
    return { success: false, platform, message: String(err) };
  }
}
