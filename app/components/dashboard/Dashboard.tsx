import React, { useState, useEffect, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { 
  loadVisualizations, 
  saveVisualization,
  updateVisualization,
  deleteVisualization,
  exportVisualizations,
  importVisualizations,
  type Visualization
} from '~/lib/stores/visualizations';
import { useStore } from '@nanostores/react';
import { visualizationStore } from '~/lib/stores/visualizations';

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = () => {
  const { items: visualizations, loading, error } = useStore(visualizationStore);
  const [selectedTab, setSelectedTab] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<Visualization | null>(null);

  useEffect(() => {
    loadVisualizations();
  }, []);

  const folders = [...new Set(visualizations.map((v: Visualization) => v.folder || 'Uncategorized'))];

  const filteredVisualizations = visualizations.filter((viz: Visualization) => 
    (!currentFolder || viz.folder === currentFolder) &&
    (viz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     viz.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     viz.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importVisualizations(file);
      } catch (error) {
        console.error('Import failed:', error);
      }
    }
  };

  const handleEdit = (visualization: Visualization) => {
    setEditingItem(visualization);
  };

  const handleSaveEdit = async () => {
    if (editingItem) {
      await updateVisualization(editingItem);
      setEditingItem(null);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) {
      await Promise.all(ids.map(id => deleteVisualization(id)));
      setSelectedItems(new Set());
    }
  };

  const handleMoveToFolder = async (folder: string) => {
    const selected = Array.from(selectedItems);
    await Promise.all(
      selected.map(id => {
        const viz = visualizations.find((v: Visualization) => v.id === id);
        if (viz) {
          return updateVisualization({ ...viz, folder });
        }
        return Promise.resolve();
      })
    );
    setSelectedItems(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="dashboard p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Concept Visualizations</h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search visualizations..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={currentFolder}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentFolder(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300"
          >
            <option value="">All Folders</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('grid')}
              className={`px-3 py-1 rounded ${
                selectedTab === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setSelectedTab('list')}
              className={`px-3 py-1 rounded ${
                selectedTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {selectedItems.size > 0 && (
        <div className="mb-4 p-2 bg-gray-100 rounded flex gap-2 items-center">
          <span>{selectedItems.size} items selected</span>
          <button
            onClick={() => handleDelete(Array.from(selectedItems))}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Selected
          </button>
          <select
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMoveToFolder(e.target.value)}
            className="px-2 py-1 rounded border border-gray-300"
          >
            <option value="">Move to folder...</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
            <option value="__new__">New Folder...</option>
          </select>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => exportVisualizations()}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export
        </button>
        <label className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {selectedTab === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisualizations.map((viz: Visualization) => (
            <div 
              key={viz.id} 
              className={`visualization bg-white rounded-lg shadow-md p-4 ${
                selectedItems.has(viz.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(viz.id)}
                    onChange={() => toggleSelect(viz.id)}
                    className="h-4 w-4"
                  />
                  <h3 className="text-lg font-semibold">{viz.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(viz)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <span className="i-ph:pencil text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete([viz.id])}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <span className="i-ph:trash text-lg" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {viz.content}
                </ReactMarkdown>
              </div>
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(viz.timestamp).toLocaleString()}</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {viz.category}
                  </span>
                  {viz.folder && (
                    <span className="px-2 py-1 bg-blue-100 rounded">
                      {viz.folder}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisualizations.map((viz: Visualization) => (
            <div 
              key={viz.id} 
              className={`visualization bg-white rounded-lg shadow-md p-4 ${
                selectedItems.has(viz.id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(viz.id)}
                    onChange={() => toggleSelect(viz.id)}
                    className="h-4 w-4"
                  />
                  <h3 className="text-lg font-semibold">{viz.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(viz)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit"
                  >
                    <span className="i-ph:pencil text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete([viz.id])}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <span className="i-ph:trash text-lg" />
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {viz.content}
                </ReactMarkdown>
              </div>
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(viz.timestamp).toLocaleString()}</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {viz.category}
                  </span>
                  {viz.folder && (
                    <span className="px-2 py-1 bg-blue-100 rounded">
                      {viz.folder}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredVisualizations.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          {searchTerm ? 'No matching visualizations found.' : 'No visualizations yet. Start by creating one!'}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Visualization</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingItem.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => 
                  setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Title"
              />
              <textarea
                value={editingItem.content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => 
                  setEditingItem({ ...editingItem, content: e.target.value })}
                className="w-full px-3 py-2 border rounded h-64"
                placeholder="Content"
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setEditingItem({ ...editingItem, category: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Category"
                />
                <input
                  type="text"
                  value={editingItem.folder || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setEditingItem({ ...editingItem, folder: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Folder"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
