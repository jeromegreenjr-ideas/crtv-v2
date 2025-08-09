"use client";

import { useEffect, useRef } from 'react';

export function useEventSource(url: string, onMessage: (data: any) => void) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: any;

    const connect = () => {
      eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handlerRef.current(data);
        } catch (e) {
          // ignore
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        retryTimeout = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      eventSource?.close();
    };
  }, [url]);
}