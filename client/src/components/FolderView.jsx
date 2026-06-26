import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft } from 'lucide-react';
import MediaModal from './MediaModal';
import MediaViewer from './MediaViewer';
import { useView } from '../context/ViewContext';

const COLS_CLASS = {
  3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5',
  6: 'grid-cols-6', 7: 'grid-cols-7', 8: 'grid-cols-8',
  9: 'grid-cols-9', 10: 'grid-cols-10',
};

function Thumbnail({ item, index, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(index)}
      className={`aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-zinc-900 transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-inset' : ''
      }`}
    >
      {item.type === 'video' ? (
        <>
          <video
            src={`http://localhost:5000${item.streamUrl}#t=0.1`}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          <div className="absolute top-1.5 right-1.5">
            <Play className="w-4 h-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] fill-white/30" />
          </div>
        </>
      ) : (
        <img
          src={`http://localhost:5000${item.streamUrl}`}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors pointer-events-none" />
    </div>
  );
}

export default function FolderView() {
  const { id } = useParams();
  const { viewMode, gridCols } = useView();

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [folder, setFolder] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // When switching to grid mode, clear pane selection
  useEffect(() => {
    if (viewMode === 'grid') setSelectedIndex(null);
  }, [viewMode]);

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const [foldersRes, mediaRes] = await Promise.all([
          fetch('http://localhost:5000/api/folders'),
          fetch(`http://localhost:5000/api/folders/${id}/media`),
        ]);
        const foldersData = await foldersRes.json();
        setFolder(foldersData.find(f => f.id === parseInt(id)));

        const mediaData = await mediaRes.json();
        if (!mediaRes.ok) throw new Error(mediaData.error || 'Failed to load media');
        setMedia(mediaData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFolderData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-blue-500 hover:underline inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Folders
        </Link>
      </div>
    );
  }

  const colsClass = COLS_CLASS[gridCols] || 'grid-cols-5';

  const ProfileCard = (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl mb-4">
      <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 shrink-0">
        <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-gray-300 dark:text-zinc-600 select-none">
            {folder?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold truncate">{folder?.name}</h2>
        <p className="text-[11px] text-gray-400 dark:text-zinc-500 truncate mt-0.5">{folder?.path}</p>
        <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
          <span className="font-semibold text-gray-700 dark:text-zinc-300">{media.length}</span> files
        </p>
      </div>
    </div>
  );

  if (viewMode === 'grid') {
    return (
      <>
        <div className="max-w-lg mx-auto">
          {ProfileCard}
        </div>
        {media.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No media found in this folder.</p>
        ) : (
          <div className={"grid gap-px " + colsClass}>
            {media.map((item, index) => (
              <Thumbnail
                key={item.name}
                item={item}
                index={index}
                selected={false}
                onClick={setSelectedIndex}
              />
            ))}
          </div>
        )}

        {selectedIndex !== null && (
          <MediaModal
            media={media[selectedIndex]}
            onClose={() => setSelectedIndex(null)}
            onNext={selectedIndex < media.length - 1 ? () => setSelectedIndex(i => i + 1) : undefined}
            onPrev={selectedIndex > 0 ? () => setSelectedIndex(i => i - 1) : undefined}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex flex-col min-w-0 overflow-hidden shrink-0" style={{ width: '47%' }}>
        {ProfileCard}
        <div className={"overflow-y-auto flex-1 grid " + colsClass + " gap-px place-content-start"}>
          {media.map((item, index) => (
            <Thumbnail
              key={item.name}
              item={item}
              index={index}
              selected={selectedIndex === index}
              onClick={setSelectedIndex}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden bg-zinc-950 relative min-w-0">
        {selectedIndex !== null ? (
          <>
            <div
              className="absolute inset-0 z-0"
              onClick={() => setSelectedIndex(null)}
            />
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-4">
              <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                <MediaViewer media={media[selectedIndex]} />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm select-none">
            Select a file to preview
          </div>
        )}
      </div>
    </div>
  );
}
