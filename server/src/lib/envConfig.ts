const DEV_JWT_SECRET = 'dev-secret-change-in-production';

let validated = false;

export function validateProductionEnv(): void {
  if (validated) {
    return;
  }
  validated = true;

  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required in production');
  }

  if (jwtSecret === DEV_JWT_SECRET) {
    throw new Error('JWT_SECRET must not use the default development value in production');
  }

  if (!process.env.SITE_URL?.trim()) {
    throw new Error('SITE_URL is required in production');
  }
}

export function getJwtSecret(): string {
  validateProductionEnv();

  const configured = process.env.JWT_SECRET?.trim();
  if (configured) {
    return configured;
  }

  return DEV_JWT_SECRET;
}

export function getSiteUrl(): string | null {
  const configured = process.env.SITE_URL?.replace(/\/$/, '').trim();
  return configured || null;
}
