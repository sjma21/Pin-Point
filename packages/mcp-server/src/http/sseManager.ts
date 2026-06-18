import { generateId } from '@sajalmishra/markpin-shared';

interface Connection {
  readonly id: string;
  readonly sessionId: string;
  readonly enqueue: (data: string) => void;
}

class SSEManager {
  private connections = new Map<string, Connection>();

  register(sessionId: string, enqueue: (data: string) => void): string {
    const id = generateId('sse');
    this.connections.set(id, { id, sessionId, enqueue });
    return id;
  }

  remove(id: string): void {
    this.connections.delete(id);
  }

  broadcastToSession(sessionId: string, type: string, data: unknown): void {
    const payload = this.format(type, data);
    for (const conn of this.connections.values()) {
      if (conn.sessionId === sessionId) conn.enqueue(payload);
    }
  }

  broadcastAll(type: string, data: unknown): void {
    const payload = this.format(type, data);
    for (const conn of this.connections.values()) conn.enqueue(payload);
  }

  private format(type: string, data: unknown): string {
    return `data: ${JSON.stringify({ type, ...((typeof data === 'object' && data !== null) ? data : { payload: data }) })}\n\n`;
  }
}

export const sseManager = new SSEManager();
