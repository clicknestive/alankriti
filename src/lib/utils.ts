import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ALC-${year}-${randomNum}`;
}

export const ORDER_STATUS_STEPS = [
  'ORDER PLACED',
  'PAYMENT CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'DELIVERED',
] as const;

export function getOrderStatusIndex(status: string): number {
  const index = ORDER_STATUS_STEPS.indexOf(status as any);
  return index !== -1 ? index : 0;
}

export function parseProductImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .map((img) => (typeof img === 'object' && img !== null ? img.url || '' : String(img || '')))
      .filter(Boolean);
  }
  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((img) => (typeof img === 'object' && img !== null ? img.url || '' : String(img || '')))
          .filter(Boolean);
      }
      if (typeof parsed === 'string' && parsed) return [parsed];
    } catch {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return [trimmed];
      }
    }
  }
  return [];
}

