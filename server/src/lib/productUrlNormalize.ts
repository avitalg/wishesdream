export function normalizeProductUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname.includes('aliexpress.com')) {
    const itemMatch = parsed.pathname.match(/\/item\/(\d+)\.html/i);
    if (itemMatch) {
      return `https://www.aliexpress.com/item/${itemMatch[1]}.html`;
    }

    const productId = parsed.searchParams.get('productId');
    if (productId && /^\d+$/.test(productId)) {
      return `https://www.aliexpress.com/item/${productId}.html`;
    }
  }

  if (parsed.hostname.includes('shein.com')) {
    const goodsId = parsed.searchParams.get('goods_id');
    if (goodsId && /^\d+$/.test(goodsId) && parsed.pathname.includes('/ark/')) {
      return `https://${parsed.hostname}/ark/5470?goods_id=${goodsId}`;
    }
  }

  return url;
}
