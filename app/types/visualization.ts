// Core Types
export type VisualizationType = 'interactive' | 'static' | 'animated' | '3d';
export type VisualizationStatus = 'creating' | 'ready' | 'updating' | 'error';
export type RenderEngine = 'svg' | 'canvas' | 'webgl';

// Configuration Interfaces
export interface VisualizationConfig {
  type: VisualizationType;
  engine: RenderEngine;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  interactive?: boolean;
  animations?: boolean;
  theme?: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
  };
}

// Data Structures
export interface VisualizationElement {
  id: string;
  type: string;
  properties: Record<string, any>;
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  style?: Record<string, any>;
}

export interface VisualizationMetadata {
  created: number;
  modified: number;
  version: string;
  author?: string;
  tags?: string[];
}

