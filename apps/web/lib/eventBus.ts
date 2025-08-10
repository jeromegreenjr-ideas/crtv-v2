import { EventEmitter } from 'events';

// Global singleton across serverless invocations per instance
const globalForEventBus = global as unknown as { __crtvEventBus?: EventEmitter };

export const eventBus: EventEmitter = globalForEventBus.__crtvEventBus || new EventEmitter();

eventBus.setMaxListeners(1000);

if (!globalForEventBus.__crtvEventBus) {
  globalForEventBus.__crtvEventBus = eventBus;
}

export function broadcast(topic: string, data: unknown) {
  eventBus.emit(topic, data);
}