export function normalizeProductUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname.includes('aliexpress.com')) {
    const productId = parsed.searchParams.get('productId');
    if (productId && /^\d+$/.test(productId) && !parsed.pathname.includes('/item/')) {
      return `https://www.aliexpress.com/item/${productId}.html`;
    }
  }

  return url;
}
