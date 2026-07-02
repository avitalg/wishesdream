import type { ExportRow, GiftItem, GiftListSummary, ParsedProduct, User } from '../types/index.js';
import {
  clearAuthToken,
  getAuthToken,
  getGuestToken,
  getStoredUser,
  setAuthToken,
  setGuestToken,
  setStoredUser,
} from './storage.js';

export {
  clearAuthToken,
  getAuthToken,
  getGuestToken,
  getStoredUser,
  setAuthToken,
  setGuestToken,
  setStoredUser,
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  guest?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (options.guest) {
    const guestToken = getGuestToken();
    if (guestToken) {
      headers['X-Guest-Token'] = guestToken;
    }
  }

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error ?? 'Request failed', response.status);
  }

  return data as T;
}

export const api = {
  register(email: string, name: string, password: string) {
    return request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { email, name, password },
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getMyLists() {
    return request<{ lists: Array<{ id: number; public_id: string; title: string; created_at: string }> }>(
      '/api/lists/mine',
      { auth: true },
    );
  },

  createList(title: string) {
    return request<{ list: { public_id: string; title: string } }>('/api/lists', {
      method: 'POST',
      body: { title },
      auth: true,
    });
  },

  getList(publicId: string) {
    return request<{ list: GiftListSummary; items: GiftItem[] }>(`/api/lists/${publicId}`, {
      auth: true,
      guest: true,
    });
  },

  parseUrl(url: string) {
    return request<ParsedProduct>('/api/lists/parse-url', {
      method: 'POST',
      body: { url },
      auth: true,
    });
  },

  addItem(publicId: string, productUrl: string) {
    return request<{ items: GiftItem[] }>(`/api/lists/${publicId}/items`, {
      method: 'POST',
      body: { product_url: productUrl },
      auth: true,
    });
  },

  deleteItem(publicId: string, itemId: number) {
    return request<void>(`/api/lists/${publicId}/items/${itemId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  claimItem(
    publicId: string,
    payload: {
      item_id: number;
      guest_name: string;
      guest_token?: string;
      on_behalf?: boolean;
    },
  ) {
    return request<{ claim: { id: number; guest_token: string }; items: GiftItem[] }>(
      `/api/lists/${publicId}/claim`,
      {
        method: 'POST',
        body: payload,
        auth: true,
        guest: true,
      },
    );
  },

  unclaimItem(publicId: string, itemId: number) {
    return request<void>(`/api/lists/${publicId}/claim/${itemId}`, {
      method: 'DELETE',
      auth: true,
      guest: true,
    });
  },

  exportList(publicId: string) {
    return request<{ list: { title: string }; items: ExportRow[] }>(`/api/lists/${publicId}/export`, {
      auth: true,
    });
  },
};
