// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '../../api/client.js';
import { useMyLists } from './useMyLists.js';
import { createQueryWrapper } from '../../test/queryWrapper.js';

vi.mock('../../api/client.js', () => ({
  api: {
    getMyLists: vi.fn(),
  },
}));

describe('useMyLists', () => {
  beforeEach(() => {
    vi.mocked(api.getMyLists).mockReset();
  });

  it('fetches and selects lists when enabled', async () => {
    vi.mocked(api.getMyLists).mockResolvedValue({
      lists: [{ id: 1, public_id: 'abc123', title: 'Shower', created_at: '2026-01-01' }],
    });

    const { result } = renderHook(() => useMyLists(true), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { id: 1, public_id: 'abc123', title: 'Shower', created_at: '2026-01-01' },
    ]);
    expect(api.getMyLists).toHaveBeenCalledOnce();
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useMyLists(false), {
      wrapper: createQueryWrapper(),
    });

    expect(api.getMyLists).not.toHaveBeenCalled();
  });
});
