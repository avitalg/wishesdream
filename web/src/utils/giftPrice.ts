export const GIFT_CURRENCY_CODES = ['ILS', 'USD', 'EUR', 'GBP'] as const;

export type GiftCurrencyCode = (typeof GIFT_CURRENCY_CODES)[number];

const CURRENCY_SYMBOLS: Record<GiftCurrencyCode, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const SYMBOL_TO_CODE = Object.fromEntries(
  Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => [symbol, code]),
) as Record<string, GiftCurrencyCode>;

export function getCurrencySymbol(code: string): string | null {
  if (!code) {
    return null;
  }

  return CURRENCY_SYMBOLS[code as GiftCurrencyCode] ?? null;
}

export function parseGiftPrice(price: string | null | undefined): {
  amount: string;
  currency: string;
} {
  const trimmed = price?.trim() ?? '';
  if (!trimmed) {
    return { amount: '', currency: '' };
  }

  for (const code of GIFT_CURRENCY_CODES) {
    const match = trimmed.match(new RegExp(`^${code}\\s+(.+)$`, 'i'));
    if (match) {
      return { amount: match[1].trim(), currency: code };
    }
  }

  for (const [symbol, code] of Object.entries(SYMBOL_TO_CODE)) {
    if (trimmed.startsWith(symbol)) {
      return { amount: trimmed.slice(symbol.length).trim(), currency: code };
    }
  }

  return { amount: trimmed, currency: '' };
}

export function formatGiftPrice(amount: string, currency: string): string | null {
  const trimmedAmount = amount.trim();
  if (!trimmedAmount) {
    return null;
  }

  if (!currency) {
    return trimmedAmount;
  }

  const symbol = getCurrencySymbol(currency);
  if (symbol) {
    return `${symbol}${trimmedAmount}`;
  }

  return `${currency} ${trimmedAmount}`;
}

export function applyParsedGiftPrice(price: string | null | undefined): {
  amount: string;
  currency: string;
} {
  return parseGiftPrice(price);
}
