import { useEffect } from 'react';
import { queryClient } from '../lib/queryClient.js';
import { listKeys } from '../lib/queryKeys.js';

export function useListWebSocket(listId: string | undefined): void {
  useEffect(() => {
    if (!listId) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws?listId=${listId}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type: string;
          listId: string;
        };
        if (message.type === 'item_status_changed' && message.listId === listId) {
          queryClient.invalidateQueries({ queryKey: listKeys.detailPrefix(listId) });
        }
      } catch {
        // Ignore malformed messages.
      }
    };

    return () => {
      ws.close();
    };
  }, [listId]);
}
