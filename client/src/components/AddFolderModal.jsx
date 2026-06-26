import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddFolderModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !path) {
      setError('Name and path are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, path })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add folder');
      }

      onSuccess(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="font-semibold text-lg">Add New Folder</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Folder Name (e.g., Vacation 2024)</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Summer Trip"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Absolute OS Path</label>
            <input 
              type="text" 
              value={path}
              onChange={e => setPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="C:\Users\Name\Pictures\Summer"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Folder'}
          </button>
        </form>
      </div>
    </div>
  );
}