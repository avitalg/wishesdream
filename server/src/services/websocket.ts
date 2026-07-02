import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export interface ItemStatusMessage {
  type: 'item_status_changed';
  listId: string;
  itemId: number;
  is_claimed: boolean;
}

type ClientInfo = {
  listId: string;
  ws: WebSocket;
};

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<ClientInfo> = new Set();

  attach(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url ?? '', 'http://localhost');
      const listId = url.searchParams.get('listId');

      if (!listId) {
        ws.close(1008, 'listId required');
        return;
      }

      const client: ClientInfo = { listId, ws };
      this.clients.add(client);

      ws.on('close', () => {
        this.clients.delete(client);
      });

      ws.on('error', () => {
        this.clients.delete(client);
      });
    });
  }

  broadcastItemStatus(listId: string, itemId: number, isClaimed: boolean): void {
    const message: ItemStatusMessage = {
      type: 'item_status_changed',
      listId,
      itemId,
      is_claimed: isClaimed,
    };

    const payload = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.listId === listId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }
}

export const wsManager = new WebSocketManager();
