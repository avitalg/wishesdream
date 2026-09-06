import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_REDIRECTS = 5;

function isBlockedIpv4(a: number, b: number): boolean {
  if (a === 0 || a === 10 || a === 127) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 100 && b >= 64 && b <= 127) {
    return true;
  }
  return false;
}

export function isBlockedIp(address: string): boolean {
  if (address.includes(':')) {
    const normalized = address.toLowerCase();
    if (normalized === '::1') {
      return true;
    }
    if (normalized.startsWith('fe80:')) {
      return true;
    }
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
      return true;
    }
    return false;
  }

  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  return isBlockedIpv4(parts[0], parts[1]);
}

export function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');

  if (normalized === 'localhost') {
    return true;
  }
  if (normalized.endsWith('.localhost')) {
    return true;
  }
  if (normalized.endsWith('.internal')) {
    return true;
  }
  if (normalized === 'metadata.google.internal') {
    return true;
  }

  return false;
}

function parseHttpUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are allowed');
  }

  if (url.username || url.password) {
    throw new Error('URLs with credentials are not allowed');
  }

  return url;
}

export function isSafeHttpUrl(urlString: string): boolean {
  try {
    const url = parseHttpUrl(urlString);
    if (isBlockedHostname(url.hostname)) {
      return false;
    }

    const ipVersion = isIP(url.hostname);
    if (ipVersion && isBlockedIp(url.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function sanitizeHttpUrl(urlString: string | null | undefined): string | null {
  if (!urlString?.trim()) {
    return null;
  }

  const trimmed = urlString.trim();
  return isSafeHttpUrl(trimmed) ? trimmed : null;
}

export async function assertSafeFetchUrl(urlString: string): Promise<URL> {
  const url = parseHttpUrl(urlString);

  if (isBlockedHostname(url.hostname)) {
    throw new Error('URL host is not allowed');
  }

  const ipVersion = isIP(url.hostname);
  if (ipVersion) {
    if (isBlockedIp(url.hostname)) {
      throw new Error('URL host is not allowed');
    }
    return url;
  }

  const { address } = await lookup(url.hostname, { verbatim: true });
  if (isBlockedIp(address)) {
    throw new Error('URL host is not allowed');
  }

  return url;
}

export async function safeFetch(
  urlString: string,
  init: RequestInit = {},
  redirectCount = 0,
): Promise<Response> {
  await assertSafeFetchUrl(urlString);

  const response = await fetch(urlString, {
    ...init,
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirectCount >= MAX_REDIRECTS) {
      throw new Error('Too many redirects');
    }

    const location = response.headers.get('location');
    if (!location) {
      throw new Error('Redirect missing location header');
    }

    const nextUrl = new URL(location, urlString).toString();
    return safeFetch(nextUrl, init, redirectCount + 1);
  }

  return response;
}
