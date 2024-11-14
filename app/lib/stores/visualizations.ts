import { map } from 'nanostores';
import { openDatabase } from '../persistence/visualizations-db';

export interface Visualization {
  id: string;
  content: string;
  timestamp: number;
  title: string;
  category: string;
  tags?: string[];
  folder?: string;
}

export const visualizationStore = map<{
  items: Visualization[];
  loading: boolean;
  error: string | null;
}>({
  items: [],
  loading: false,
  error: null,
});

export async function loadVisualizations() {
  visualizationStore.setKey('loading', true);
  try {
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');
    
    const items = await db.getAll();
    visualizationStore.set({ items, loading: false, error: null });
  } catch (error) {
    visualizationStore.set({ 
      items: [], 
      loading: false, 
      error: error instanceof Error ? error.message : 'Failed to load visualizations' 
    });
  }
}

export async function saveVisualization(visualization: Omit<Visualization, 'id' | 'timestamp'>) {
  try {
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');

    const id = await db.getNextId();
    const timestamp = Date.now();
    const newVisualization = { ...visualization, id, timestamp };
    
    await db.add(newVisualization);
    
    const items = [...visualizationStore.get().items, newVisualization];
    visualizationStore.setKey('items', items);
    
    return newVisualization;
  } catch (error) {
    visualizationStore.setKey('error', 
      error instanceof Error ? error.message : 'Failed to save visualization'
    );
    throw error;
  }
}

export async function updateVisualization(visualization: Visualization) {
  try {
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');
    
    await db.update(visualization);
    
    const items = visualizationStore.get().items.map(item => 
      item.id === visualization.id ? visualization : item
    );
    visualizationStore.setKey('items', items);
  } catch (error) {
    visualizationStore.setKey('error', 
      error instanceof Error ? error.message : 'Failed to update visualization'
    );
    throw error;
  }
}

export async function deleteVisualization(id: string) {
  try {
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');
    
    await db.delete(id);
    
    const items = visualizationStore.get().items.filter(item => item.id !== id);
    visualizationStore.setKey('items', items);
  } catch (error) {
    visualizationStore.setKey('error', 
      error instanceof Error ? error.message : 'Failed to delete visualization'
    );
    throw error;
  }
}

export async function exportVisualizations() {
  const { items } = visualizationStore.get();
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `visualizations-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importVisualizations(file: File) {
  try {
    const content = await file.text();
    const visualizations: Visualization[] = JSON.parse(content);
    
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');
    
    await Promise.all(visualizations.map(v => db.add(v)));
    await loadVisualizations();
  } catch (error) {
    visualizationStore.setKey('error', 
      error instanceof Error ? error.message : 'Failed to import visualizations'
    );
    throw error;
  }
}
