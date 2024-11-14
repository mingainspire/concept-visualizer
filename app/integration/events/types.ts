// Core event types that define system communication
export type EventType = 
  | 'CONCEPT_INPUT'      // User inputs a concept
  | 'PROCESSING_START'   // Processing begins
  | 'PROCESSING_END'     // Processing completes
  | 'VISUALIZATION_READY'// Visualization is ready
  | 'ERROR'             // Error occurred
  | 'STATE_UPDATE'      // State changed
  | 'SYSTEM_STATUS';    // System status update

// Base event interface
export interface SystemEvent {
  type: EventType;
  timestamp: number;
  id: string;
}

// Event payload interfaces
export interface ConceptInputEvent extends SystemEvent {
  type: 'CONCEPT_INPUT';
  data: {
    concept: string;
    options?: Record<string, any>;
  };
}

export interface ProcessingEvent extends SystemEvent {
  type: 'PROCESSING_START' | 'PROCESSING_END';
  data: {
    stage: 'concept' | 'llm' | 'visualization';
    progress?: number;
  };
}

export interface VisualizationEvent extends SystemEvent {
  type: 'VISUALIZATION_READY';
  data: {
    visualizationId: string;
    format: string;
  };
}

export interface ErrorEvent extends SystemEvent {
  type: 'ERROR';
  data: {
    code: string;
    message: string;
    context?: Record<string, any>;
  };
}

export interface StateUpdateEvent extends SystemEvent {
  type: 'STATE_UPDATE';
  data: {
    path: string[];
    value: any;
  };
}

export interface SystemStatusEvent extends SystemEvent {
  type: 'SYSTEM_STATUS';
  data: {
    status: 'ready' | 'busy' | 'error';
    message?: string;
  };
}

// Union type of all events
export type AppEvent =
  | ConceptInputEvent
  | ProcessingEvent
  | VisualizationEvent
  | ErrorEvent
  | StateUpdateEvent
  | SystemStatusEvent;
