import { useState } from 'react';
import { Outlet, Link, useNavigate, useMatch } from 'react-router-dom';
import { Plus, Camera, LayoutGrid, PanelRight } from 'lucide-react';
import AddFolderModal from './AddFolderModal';
import { useView } from '../context/ViewContext';

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { viewMode, setViewMode, gridCols, setGridCols } = useView();
  const isFolderView = useMatch('/folder/:id');

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">

      {/* ── Left Sidebar ── */}
      <aside className="w-16 shrink-0 flex flex-col items-center border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4 gap-6 z-20">
        {/* Logo mark */}
        <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white mb-2" aria-label="Home">
          <Camera className="w-5 h-5" />
        </Link>

        {/* Only show view controls on folder pages */}
        {isFolderView && (
          <>
            <div className="flex flex-col items-center gap-1 w-full px-2">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">View</span>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`w-full flex flex-col items-center py-2 rounded-lg text-[10px] font-medium gap-1 transition ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
              >
                <LayoutGrid className="w-5 h-5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('pane')}
                title="Pane view"
                className={`w-full flex flex-col items-center py-2 rounded-lg text-[10px] font-medium gap-1 transition ${viewMode === 'pane' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white' : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
              >
                <PanelRight className="w-5 h-5" />
                Pane
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 w-full px-2 flex-1">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Size</span>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{gridCols}</span>
              <div className="flex-1 flex items-center justify-center py-2" style={{ minHeight: 80 }}>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="1"
                  value={gridCols}
                  onChange={(e) => setGridCols(parseInt(e.target.value))}
                  title={`${gridCols} columns`}
                  className="accent-blue-500 cursor-pointer"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 120, width: 20, appearance: 'slider-vertical' }}
                />
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── Right Column: header + scrollable content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {!isFolderView && (
          <header className="shrink-0 h-14 border-b border-gray-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex items-center px-6 justify-between z-10">
            <Link to="/" className="font-bold text-lg tracking-tight">InstaGallery</Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
              aria-label="Add Folder"
            >
              <Plus className="w-5 h-5" />
            </button>
          </header>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>

      {isModalOpen && (
        <AddFolderModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newId) => {
            setIsModalOpen(false);
            if (newId) navigate(`/folder/${newId}`); else navigate(0);
          }}
        />
      )}
    </div>
  );
}
