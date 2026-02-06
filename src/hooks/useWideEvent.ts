'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createWideEventLogger } from '@/lib/wide-event-logger';
import { useAuth } from '@/contexts/AuthContext';

export function useWideEvent(eventType: string) {
  const loggerRef = useRef(createWideEventLogger());
  const { user } = useAuth();

  useEffect(() => {
    const logger = loggerRef.current;
    logger.setEventType(eventType);
    if (user?.id) logger.setUser(user.id);
    
    return () => {
      logger.flush();
    };
  }, [eventType, user?.id]);

  const log = useCallback((key: string, value: unknown) => {
    loggerRef.current.log(key, value);
  }, []);

  const logClick = useCallback((target: string) => {
    loggerRef.current.log('click', target);
  }, []);

  const logSubmit = useCallback((form: string) => {
    loggerRef.current.log('submit', form);
  }, []);

  const logError = useCallback((error: Error) => {
    loggerRef.current.logError(error);
  }, []);

  const flush = useCallback(() => {
    loggerRef.current.flush();
    loggerRef.current.reset();
  }, []);

  return { log, logClick, logSubmit, logError, flush, traceId: loggerRef.current.getTraceId() };
}
