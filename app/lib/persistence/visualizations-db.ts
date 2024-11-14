import { createScopedLogger } from '~/utils/logger';
import type { Visualization } from '../stores/visualizations';

const logger = createScopedLogger('VisualizationsDB');
const DB_NAME = 'boltVisualizations';
const STORE_NAME = 'visualizations';
const DB_VERSION = 1;

interface VisualizationsDB extends IDBDatabase {
  getAll(): Promise<Visualization[]>;
  get(id: string): Promise<Visualization>;
  add(visualization: Visualization): Promise<void>;
  update(visualization: Visualization): Promise<void>;
  delete(id: string): Promise<void>;
  getNextId(): Promise<string>;
}

export async function openDatabase(): Promise<VisualizationsDB | undefined> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('folder', 'folder', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result as VisualizationsDB;

      // Add wrapper methods to the database object
      db.getAll = () => getAllVisualizations(db);
      db.get = (id: string) => getVisualization(db, id);
      db.add = (visualization: Visualization) => addVisualization(db, visualization);
      db.update = (visualization: Visualization) => updateVisualization(db, visualization);
      db.delete = (id: string) => deleteVisualization(db, id);
      db.getNextId = () => getNextId(db);

      resolve(db);
    };

    request.onerror = (event: Event) => {
      logger.error((event.target as IDBOpenDBRequest).error);
      resolve(undefined);
    };
  });
}

async function getAllVisualizations(db: IDBDatabase): Promise<Visualization[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getVisualization(db: IDBDatabase, id: string): Promise<Visualization> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addVisualization(db: IDBDatabase, visualization: Visualization): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(visualization);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function updateVisualization(db: IDBDatabase, visualization: Visualization): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(visualization);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteVisualization(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getNextId(db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const keys = request.result as string[];
      const highestId = keys.reduce((max, current) => {
        const num = parseInt(current, 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      resolve(String(highestId + 1));
    };

    request.onerror = () => reject(request.error);
  });
}
