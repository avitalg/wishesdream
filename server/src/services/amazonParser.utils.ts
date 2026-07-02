export const AMAZON_HOST_PATTERN =
  /(?:amazon\.(?:com|co\.uk|de|fr|ca|com\.au|co\.jp|in|it|es|com\.mx|com\.br|nl|se|pl|com\.tr|ae|sa|sg)|amzn\.to|a\.co)\b/i;
export const ASIN_PATTERN =
  /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/exec\/obidos\/ASIN\/|\/product\/)([A-Z0-9]{10})/i;

export function isAmazonUrl(url: string): boolean {
  try {
    return AMAZON_HOST_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function extractAmazonAsin(url: string): string | null {
  const match = url.match(ASIN_PATTERN);
  return match?.[1]?.toUpperCase() ?? null;
}

export function getAmazonProductUrl(asin: string): string {
  return `https://www.amazon.com/gp/product/${asin}`;
}

export function getAmazonImageUrl(asin: string): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`;
}

export function isAmazonBotBlock(html: string): boolean {
  if (html.length < 50000) {
    return (
      html.includes('opfcaptcha.amazon.com') ||
      html.includes('Robot Check') ||
      html.includes('Enter the characters you see below') ||
      /\<title[^>]*>\s*Amazon\.com\s*\<\/title\>/i.test(html)
    );
  }
  return false;
}

export function isGenericAmazonImage(url: string | null | undefined): boolean {
  if (!url) {
    return true;
  }
  return (
    url.includes('/share-icons/') ||
    url.includes('/marketing/prime/') ||
    url.includes('/G/01/icons/') ||
    url.includes('amazon.png')
  );
}

export function parseAmazonTitleFromDescription(description: string): string | null {
  const match = description.match(/Amazon\.com\s*:\s*(.+?)\s*:\s*.+$/i);
  return match?.[1]?.trim() ?? null;
}

export function parseAmazonTitleFromPageTitle(pageTitle: string): string | null {
  const cleaned = pageTitle
    .replace(/^Amazon\.com\s*:\s*/i, '')
    .replace(/\s*:\s*Amazon\.com.*$/i, '')
    .replace(/\s*-\s*Amazon\.com.*$/i, '')
    .trim();
  return cleaned && cleaned !== 'Amazon.com' ? cleaned : null;
}
