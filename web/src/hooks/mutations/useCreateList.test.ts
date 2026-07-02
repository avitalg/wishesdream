// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { api } from '../../api/client.js';
import { listKeys } from '../../lib/queryKeys.js';
import { useCreateList } from './useCreateList.js';
import { createQueryWrapper, createTestQueryClient } from '../../test/queryWrapper.js';

vi.mock('../../api/client.js', () => ({
  api: {
    createList: vi.fn(),
    getMyLists: vi.fn(),
  },
}));

describe('useCreateList', () => {
  beforeEach(() => {
    vi.mocked(api.createList).mockReset();
    vi.mocked(api.getMyLists).mockReset();
  });

  it('invalidates my lists cache after creating a list', async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(api.createList).mockResolvedValue({
      list: { public_id: 'new-list', title: 'New Shower' },
    });

    const { result } = renderHook(() => useCreateList(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync('New Shower');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: listKeys.mine() });
  });
});
