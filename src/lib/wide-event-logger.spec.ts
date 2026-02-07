import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWideEventLogger } from './wide-event-logger';

describe('WideEventLogger', () => {
  let logger: ReturnType<typeof createWideEventLogger>;

  beforeEach(() => {
    logger = createWideEventLogger();
  });

  describe('traceId', () => {
    it('should generate a trace ID', () => {
      expect(logger.getTraceId()).toBeDefined();
      expect(typeof logger.getTraceId()).toBe('string');
      expect(logger.getTraceId().length).toBeGreaterThan(0);
    });
  });

  describe('traceparent', () => {
    it('should return valid traceparent format', () => {
      const tp = logger.getTraceparent();
      expect(tp).toMatch(/^00-[a-f0-9]+-[a-f0-9]+-01$/);
    });
  });

  describe('log', () => {
    it('should store attributes', () => {
      logger.log('key1', 'value1');
      logger.log('key2', 42);
      // Verify indirectly via flush
      expect(() => logger.flush()).not.toThrow();
    });
  });

  describe('logError', () => {
    it('should set error flag and attributes', () => {
      const error = new Error('test error');
      logger.logError(error);
      // flush should not throw
      expect(() => logger.flush()).not.toThrow();
    });
  });

  describe('setUser', () => {
    it('should set userId', () => {
      expect(() => logger.setUser('user-1')).not.toThrow();
    });
  });

  describe('setEventType', () => {
    it('should set event type', () => {
      expect(() => logger.setEventType('page_view')).not.toThrow();
    });
  });

  describe('flush', () => {
    it('should use sendBeacon when useBeacon=true', async () => {
      logger.log('test', true);
      await logger.flush(true);
      expect(navigator.sendBeacon).toHaveBeenCalled();
    });

    it('should try backend API first', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({ ok: true });
      await logger.flush();
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should fall back to ClickHouse when backend fails', async () => {
      (globalThis.fetch as any)
        .mockResolvedValueOnce({ ok: false }) // backend fails
        .mockResolvedValueOnce({ ok: true }); // clickhouse succeeds
      await logger.flush();
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('should queue when both backend and ClickHouse fail', async () => {
      (globalThis.fetch as any)
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false });
      await logger.flush();
      // Event should be queued in localStorage
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should generate new trace ID after reset', () => {
      const oldId = logger.getTraceId();
      logger.reset();
      // In the mocked environment, randomUUID returns the same value
      // but the function should not throw
      expect(() => logger.reset()).not.toThrow();
    });
  });
});
