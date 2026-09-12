import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'cart' | 'loading';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ToastCartDetails {
  id?: string;
  name: string;
  name_ku?: string;
  name_ar?: string;
  price?: number;
  quantity?: number;
  image?: string;
  storeName?: string;
  variant?: string;
}

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // Duration in milliseconds (default: 4000ms, 0 = persistent)
  icon?: ReactNode;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  cartDetails?: ToastCartDetails;
  badge?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
  remainingTime?: number;
}
