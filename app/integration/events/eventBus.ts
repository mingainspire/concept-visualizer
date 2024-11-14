import { AppEvent, EventType } from './types';

type EventHandler = (event: AppEvent) => void;

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>>;
  private static instance: EventBus;

  private constructor() {
    this.handlers = new Map();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // Subscribe to events
  subscribe(type: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  // Publish an event
  publish(event: AppEvent): void {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
          // Publish error event
          this.publish({
            type: 'ERROR',
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            data: {
              code: 'EVENT_HANDLER_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error in event handler',
              context: { originalEvent: event }
            }
          });
        }
      });
    }
  }

  // Subscribe to multiple event types
  subscribeToMany(types: EventType[], handler: EventHandler): () => void {
    const unsubscribers = types.map(type => this.subscribe(type, handler));
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }

  // Clear all handlers
  clear(): void {
    this.handlers.clear();
  }

  // Get number of handlers for an event type
  getHandlerCount(type: EventType): number {
    return this.handlers.get(type)?.size ?? 0;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Helper function to create events
export function createEvent<T extends AppEvent>(
  type: T['type'],
  data: T['data']
): T {
  return {
    type,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    data
  } as T;
}
