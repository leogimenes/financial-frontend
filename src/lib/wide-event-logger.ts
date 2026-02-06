const STORAGE_KEY = 'wide_events_queue';
const MAX_QUEUE = 100;
const CLICKHOUSE_URL = process.env.NEXT_PUBLIC_CLICKHOUSE_URL || 'http://localhost:8123';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface WideEvent {
  trace_id: string;
  event_type: string;
  user_id: string;
  duration_ms: number;
  error: boolean;
  attributes: Record<string, unknown>;
}

class WideEventLogger {
  private traceId: string;
  private startTime: number;
  private userId = '';
  private eventType = 'page_action';
  private attributes: Record<string, unknown> = {};
  private error = false;

  constructor() {
    this.traceId = this.generateTraceId();
    this.startTime = Date.now();
    if (typeof window !== 'undefined') {
      this.retryQueue();
      window.addEventListener('beforeunload', () => this.flush(true));
    }
  }

  private generateTraceId(): string {
    try {
      return crypto.randomUUID().replace(/-/g, '');
    } catch {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  getTraceId(): string {
    return this.traceId;
  }

  getTraceparent(): string {
    const spanId = this.generateTraceId().slice(0, 16);
    return `00-${this.traceId}-${spanId}-01`;
  }

  setUser(userId: string): void {
    try { this.userId = userId; } catch {}
  }

  setEventType(type: string): void {
    try { this.eventType = type; } catch {}
  }

  log(key: string, value: unknown): void {
    try { this.attributes[key] = value; } catch {}
  }

  logError(error: Error): void {
    try {
      this.error = true;
      this.attributes['error.type'] = error.name;
      this.attributes['error.message'] = error.message;
      this.attributes['error.stack'] = error.stack?.slice(0, 500);
    } catch {}
  }

  async flush(useBeacon = false): Promise<void> {
    try {
      const event: WideEvent = {
        trace_id: this.traceId,
        event_type: this.eventType,
        user_id: this.userId,
        duration_ms: Date.now() - this.startTime,
        error: this.error,
        attributes: this.attributes,
      };

      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(`${API_URL}/events`, JSON.stringify(event));
        return;
      }

      const sent = await this.sendToBackend(event);
      if (!sent) {
        const direct = await this.sendToClickHouse(event);
        if (!direct) this.queueEvent(event);
      }
    } catch {
      try { this.queueEvent(this.buildEvent()); } catch {}
    }
  }

  private buildEvent(): WideEvent {
    return {
      trace_id: this.traceId,
      event_type: this.eventType,
      user_id: this.userId,
      duration_ms: Date.now() - this.startTime,
      error: this.error,
      attributes: this.attributes,
    };
  }

  private async sendToBackend(event: WideEvent): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(event),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async sendToClickHouse(event: WideEvent): Promise<boolean> {
    try {
      const ts = new Date().toISOString().replace('T', ' ').replace('Z', '');
      const row = `${event.trace_id}\t${ts}\tfrontend\tfrontend_fallback\t${event.event_type}\t${event.user_id}\t${event.duration_ms}\t${event.error ? 1 : 0}\t${JSON.stringify(event.attributes)}`;
      const res = await fetch(`${CLICKHOUSE_URL}/?query=${encodeURIComponent('INSERT INTO events FORMAT TabSeparated')}`, {
        method: 'POST',
        body: row,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private queueEvent(event: WideEvent): void {
    try {
      const queue = this.getQueue();
      queue.push(event);
      if (queue.length > MAX_QUEUE) queue.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      console.warn('[WideEvent] Queued event for retry:', event.trace_id);
    } catch {}
  }

  private getQueue(): WideEvent[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private async retryQueue(): Promise<void> {
    try {
      const queue = this.getQueue();
      if (queue.length === 0) return;
      localStorage.removeItem(STORAGE_KEY);
      for (const event of queue) {
        const sent = await this.sendToBackend(event);
        if (!sent) this.queueEvent(event);
      }
    } catch {}
  }

  reset(): void {
    this.traceId = this.generateTraceId();
    this.startTime = Date.now();
    this.eventType = 'page_action';
    this.attributes = {};
    this.error = false;
  }
}

export const wideEventLogger = typeof window !== 'undefined' ? new WideEventLogger() : null;

export function createWideEventLogger(): WideEventLogger {
  return new WideEventLogger();
}
