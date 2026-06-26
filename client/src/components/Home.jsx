import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Trash2 } from 'lucide-react';

export default function Home() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/folders');
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this folder?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/folders/${id}`, { method: 'DELETE' });
      setFolders(folders.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-24 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Folder className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No folders yet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Click the + button at the top to add a local folder and start viewing your media.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {folders.map(folder => (
        <Link 
          key={folder.id} 
          to={`/folder/${folder.id}`}
          className="group relative flex items-center p-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 rounded-2xl transition"
        >
          <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 mr-4 flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
              <Folder className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="font-semibold text-lg truncate">{folder.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate opacity-80" title={folder.path}>{folder.path}</p>
          </div>
          
          <button 
            onClick={(e) => handleDelete(e, folder.id)}
            className="absolute right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </Link>
      ))}
    </div>
  );
}