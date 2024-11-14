// Visualization Types
export type VisualizationType = 'interactive' | 'static' | 'animated';
export type Dimensions = '2d' | '3d';
export type LLMProvider = 'local' | 'api';

// Base Interfaces
export interface BaseMetadata {
  id: string;
  timestamp: number;
  concept: string;
  principles: string[];
  tags?: string[];
}

export interface VisualizationElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  position?: {
    x: number;
    y: number;
    z?: number;
  };
}

// Configuration Interfaces
export interface VisualizationConfig {
  type: VisualizationType;
  dimensions: Dimensions;
  principles: string[];
  interactive?: boolean;
  animations?: boolean;
}

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  modelName?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}

// Data Structure Interfaces
export interface VisualizationData extends BaseMetadata {
  type: VisualizationType;
  elements: VisualizationElement[];
  layout: {
    width: number;
    height: number;
    depth?: number;
    background?: string;
    grid?: boolean;
  };
  interactions?: {
    draggable?: boolean;
    zoomable?: boolean;
    rotatable?: boolean;
    clickable?: boolean;
  };
  animations?: {
    duration: number;
    frames: any[];
    transitions: any[];
  };
}

export interface ProcessedConcept {
  original: string;
  processed: {
    mainIdea: string;
    components: string[];
    relationships: Array<{
      from: string;
      to: string;
      type: string;
    }>;
    principles: string[];
  };
  visualization: {
    suggestedType: VisualizationType;
    elements: VisualizationElement[];
    layout: any;
  };
}

// Storage Interfaces
export interface StorageOptions {
  persist: boolean;
  format: 'json' | 'binary';
  compression?: boolean;
  encryption?: boolean;
}

export interface StoredVisualization extends VisualizationData {
  version: string;
  lastModified: number;
  exportFormat?: string[];
}

// Event Interfaces
export interface VisualizationEvent {
  type: string;
  target: VisualizationElement | null;
  data: any;
  timestamp: number;
}

export interface InteractionEvent extends VisualizationEvent {
  position: {
    x: number;
    y: number;
    z?: number;
  };
  inputType: 'mouse' | 'touch' | 'keyboard';
}

// Error Types
export type VisualizationError = {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
};

// Utility Types
export type RenderMode = 'svg' | 'canvas' | 'webgl';

export interface RenderOptions {
  mode: RenderMode;
  quality: 'low' | 'medium' | 'high';
  optimization?: {
    level: number;
    target: 'speed' | 'quality';
  };
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'json' | 'html';
  quality?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  includeInteractivity?: boolean;
}
