// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api, setGuestToken } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';
import { useClaimItem } from './useClaimItem.js';
import { createQueryWrapper, createTestQueryClient } from '../../test/queryWrapper.js';

vi.mock('../../api/client.js', () => ({
  api: {
    claimItem: vi.fn(),
  },
  setGuestToken: vi.fn(),
}));

describe('useClaimItem', () => {
  beforeEach(() => {
    vi.mocked(api.claimItem).mockReset();
    vi.mocked(setGuestToken).mockReset();
  });

  it('updates cached list items and stores guest token on success', async () => {
    const queryClient = createTestQueryClient();
    const publicId = 'abc123';
    const initialItems = [
      {
        id: 1,
        title: 'Stroller',
        image_url: null,
        price: null,
        product_url: 'https://example.com/stroller',
        is_claimed: false,
        claimed_by_you: false,
      },
    ];
    const updatedItems = [
      {
        id: 1,
        title: 'Stroller',
        image_url: null,
        price: null,
        product_url: 'https://example.com/stroller',
        is_claimed: true,
        claimed_by_you: true,
      },
    ];

    queryClient.setQueryData(listKeys.detail(publicId), {
      list: { id: publicId, title: 'Shower', is_creator: false, created_at: '2026-01-01' },
      items: initialItems,
    });

    vi.mocked(api.claimItem).mockResolvedValue({
      claim: { id: 10, guest_token: 'guest-token-123' },
      items: updatedItems,
    });

    const { result } = renderHook(() => useClaimItem(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      publicId,
      item_id: 1,
      guest_name: 'Sarah',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setGuestToken).toHaveBeenCalledWith('guest-token-123');
    expect(queryClient.getQueryData(listKeys.detail(publicId))).toEqual({
      list: { id: publicId, title: 'Shower', is_creator: false, created_at: '2026-01-01' },
      items: updatedItems,
    });
  });

  it('does not store guest token when claiming on behalf', async () => {
    const queryClient = createTestQueryClient();
    const publicId = 'abc123';

    queryClient.setQueryData(listKeys.detail(publicId), {
      list: { id: publicId, title: 'Shower', is_creator: true, created_at: '2026-01-01' },
      items: [
        {
          id: 1,
          title: 'Stroller',
          image_url: null,
          price: null,
          product_url: 'https://example.com/stroller',
          is_claimed: false,
          claimed_by_you: false,
          guest_name: null,
        },
      ],
    });

    vi.mocked(api.claimItem).mockResolvedValue({
      claim: { id: 10, guest_token: 'guest-token-123' },
      items: [
        {
          id: 1,
          title: 'Stroller',
          image_url: null,
          price: null,
          product_url: 'https://example.com/stroller',
          is_claimed: true,
          claimed_by_you: false,
          guest_name: 'Offline Guest',
        },
      ],
    });

    const { result } = renderHook(() => useClaimItem(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      publicId,
      item_id: 1,
      guest_name: 'Offline Guest',
      on_behalf: true,
    });

    expect(setGuestToken).not.toHaveBeenCalled();
  });
});
