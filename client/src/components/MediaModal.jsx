import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import MediaViewer from './MediaViewer';

export default function MediaModal({ media, onClose, onNext, onPrev }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white p-2"
      >
        <X className="w-8 h-8 drop-shadow-md" />
      </button>

      <div className="absolute top-4 left-4 z-[60] flex items-center gap-2 max-w-[calc(100%-6rem)]">
        <button
          onClick={(e) => e.stopPropagation()}
          aria-label="Show file name"
          className="peer p-1.5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition shrink-0"
        >
          <Info className="w-5 h-5" />
        </button>
        <span className="truncate text-sm px-2 py-1 rounded bg-blue-500 text-white opacity-0 peer-hover:opacity-100 transition-opacity">
          {media?.name}
        </span>
      </div>

      {onPrev && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 z-[60] text-white/50 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {onNext && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 z-[60] text-white/50 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      <div className="relative flex items-center justify-center w-full h-full max-w-[95vw] max-h-[95vh] p-4">
        <MediaViewer media={media} />
      </div>
    </div>
  );
}
