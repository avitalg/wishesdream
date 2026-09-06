import { describe, expect, it } from 'vitest';
import { formatGiftPrice, parseGiftPrice } from './giftPrice.js';

describe('giftPrice', () => {
  it('parses currency code prefixes', () => {
    expect(parseGiftPrice('ILS 256.30')).toEqual({ amount: '256.30', currency: 'ILS' });
    expect(parseGiftPrice('USD 29.99')).toEqual({ amount: '29.99', currency: 'USD' });
  });

  it('parses currency symbols', () => {
    expect(parseGiftPrice('$100')).toEqual({ amount: '100', currency: 'USD' });
    expect(parseGiftPrice('₪256')).toEqual({ amount: '256', currency: 'ILS' });
  });

  it('leaves plain amounts without currency', () => {
    expect(parseGiftPrice('256')).toEqual({ amount: '256', currency: '' });
    expect(parseGiftPrice('₪79 - ₪97')).toEqual({ amount: '79 - ₪97', currency: 'ILS' });
  });

  it('formats amount with selected currency', () => {
    expect(formatGiftPrice('256', 'ILS')).toBe('₪256');
    expect(formatGiftPrice('29.99', 'USD')).toBe('$29.99');
    expect(formatGiftPrice('18', 'GBP')).toBe('£18');
    expect(formatGiftPrice('256', '')).toBe('256');
    expect(formatGiftPrice('', 'ILS')).toBeNull();
  });
});
