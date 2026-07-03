// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '../../api/client.js';
import { useGiftList } from './useGiftList.js';
import { createQueryWrapper } from '../../test/queryWrapper.js';

vi.mock('../../api/client.js', () => ({
  api: {
    getList: vi.fn(),
  },
}));

describe('useGiftList', () => {
  beforeEach(() => {
    vi.mocked(api.getList).mockReset();
  });

  it('fetches list detail by public id', async () => {
    vi.mocked(api.getList).mockResolvedValue({
      list: {
        id: 'abc123',
        title: 'Baby Shower',
        is_creator: false,
        created_at: '2026-01-01',
      },
      items: [],
    });

    const { result } = renderHook(() => useGiftList('abc123'), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.list.title).toBe('Baby Shower');
    expect(api.getList).toHaveBeenCalledWith('abc123', { viewAsGuest: undefined });
  });

  it('does not fetch without a public id', () => {
    renderHook(() => useGiftList(undefined), {
      wrapper: createQueryWrapper(),
    });

    expect(api.getList).not.toHaveBeenCalled();
  });
});
