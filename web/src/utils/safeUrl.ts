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

function isBlockedIp(address: string): boolean {
  if (address.includes(':')) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd');
  }

  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return true;
  }

  return isBlockedIpv4(parts[0], parts[1]);
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');
  return (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.internal') ||
    normalized === 'metadata.google.internal'
  );
}

export function isSafeHttpUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    if (url.username || url.password) {
      return false;
    }
    if (isBlockedHostname(url.hostname)) {
      return false;
    }

    const ipv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;
    if (ipv4.test(url.hostname) && isBlockedIp(url.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
