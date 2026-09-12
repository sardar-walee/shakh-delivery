/**
 * Utility functions for UUID v4 generation and PostgreSQL UUID validation
 */

export const isValidUUID = (str?: unknown): boolean => {
  if (typeof str !== 'string' || !str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a consistent, valid UUID v4 from a string seed (such as email)
 */
export const getConsistentUUID = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Fixed standard compliant v4 pattern
  return `a0eebc99-${hex.slice(0, 4)}-4ef8-bb6d-${hex.padEnd(12, 'a').slice(0, 12)}`;
};
