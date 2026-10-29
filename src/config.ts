const env = import.meta.env;
export const mode = env.VITE_DATA_MODE || 'demo';
if (!['demo', 'firebase'].includes(mode))
  throw new Error('VITE_DATA_MODE debe ser demo o firebase.');
export const isDemo = mode === 'demo';
export const phone = env.VITE_WHATSAPP_NUMBER || '';
export const currency = env.VITE_CURRENCY || '';
export const validPhone = /^[1-9]\d{7,14}$/.test(phone);
export const validCurrency =
  /^[A-Z]{3}$/.test(currency) &&
  Intl.supportedValuesOf('currency').includes(currency) &&
  new Intl.NumberFormat('es', { style: 'currency', currency }).resolvedOptions()
    .maximumFractionDigits === 2;
export function money(minor: number) {
  return isDemo || !validCurrency
    ? `${(minor / 100).toFixed(2)} u. demo`
    : `${currency} ${new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minor / 100)}`;
}
