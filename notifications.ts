import { supabase } from './supabase';
import { isValidUUID } from '../utils/uuid';

export interface AppNotification {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  timestamp?: number;
  data?: Record<string, any>;
}

type NotificationListener = (notification: AppNotification) => void;

const listeners: Set<NotificationListener> = new Set();

/**
 * Register a global notification listener for foreground toasts
 */
export const addNotificationListener = (listener: NotificationListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Dispatch a notification to all listeners and show browser notification if allowed
 */
export const dispatchNotification = (notification: AppNotification) => {
  const notif: AppNotification = {
    ...notification,
    timestamp: notification.timestamp || Date.now(),
  };

  // 1. Notify all in-app UI listeners (toasts, header badges)
  listeners.forEach((listener) => {
    try {
      listener(notif);
    } catch (err) {
      console.error('Error in notification listener:', err);
    }
  });

  // 2. Show native browser notification if granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notif.title, {
        body: notif.body,
        icon: notif.icon || '/favicon.ico',
        tag: notif.id || `shakh-notif-${Date.now()}`,
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
};

/**
 * Request browser notification permissions and save user preference to Supabase profile
 */
export const requestNotificationPermission = async (userId?: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';

    if (userId && isGranted) {
      // Save notification preference to Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({
          push_notifications_enabled: true,
          notifications_updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.warn('Could not sync notification preference to Supabase profile:', error.message);
      }
    }

    return isGranted;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Subscribe to Supabase Realtime Channels for user-specific events, order tracking, and alerts
 */
export const subscribeToSupabaseNotifications = (userId: string) => {
  if (!userId) return () => {};

  // Supabase Realtime Broadcast Channel for direct user messages
  const userChannel = supabase
    .channel(`user-notifications:${userId}`)
    .on('broadcast', { event: 'notification' }, (payload) => {
      if (payload?.payload) {
        dispatchNotification(payload.payload as AppNotification);
      }
    })
    .subscribe();

  // Supabase Realtime Channel for user order updates (only if userId is valid UUID)
  let ordersChannel: any = null;
  if (isValidUUID(userId)) {
    ordersChannel = supabase
      .channel(`user-orders:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${userId}`,
        },
        (payload: any) => {
          const newOrder = payload.new;
          if (newOrder) {
            const statusText = newOrder.status || 'Updated';
            dispatchNotification({
              title: 'نوێکاری لە داواکاری / Order Update',
              body: `داواکاریەکەت (${newOrder.id?.slice?.(0, 8) || ''}) باری گۆڕدرا بۆ: ${statusText}`,
              data: { orderId: newOrder.id, status: newOrder.status },
            });
          }
        }
      )
      .subscribe();
  }

  return () => {
    supabase.removeChannel(userChannel);
    if (ordersChannel) {
      supabase.removeChannel(ordersChannel);
    }
  };
};

/**
 * Broadcast a realtime notification to a specific user via Supabase
 */
export const sendSupabaseRealtimeNotification = async (
  targetUserId: string,
  notification: AppNotification
) => {
  try {
    const channel = supabase.channel(`user-notifications:${targetUserId}`);
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: notification,
    });
    supabase.removeChannel(channel);
  } catch (err) {
    console.error('Failed to send Supabase realtime notification:', err);
  }
};
