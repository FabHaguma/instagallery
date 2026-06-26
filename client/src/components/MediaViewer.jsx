import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, ZoomIn, ZoomOut } from 'lucide-react';

export default function MediaViewer({ media, onClick }) {
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef(null);

  useEffect(() => { 
    setZoom(1); 
    setPan({ x: 0, y: 0 });
    setProgress(0);
  }, [media]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted(!muted);
    if (videoRef.current) videoRef.current.muted = !muted;
  };

  const togglePlay = (e) => {
    if(onClick) onClick(e);
    if (!videoRef.current) return;
    if (videoRef.current.paused) videoRef.current.play();
    else videoRef.current.pause();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0);
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickedX = e.clientX - rect.left;
    const newTime = (clickedX / rect.width) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  const handleZoomIn = (e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); };
  const handleZoomOut = (e) => { 
    e.stopPropagation(); 
    setZoom(z => {
      const newZ = Math.max(z - 0.5, 1);
      if(newZ === 1) setPan({x:0, y:0});
      return newZ;
    }); 
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  
  const handleMouseUp = () => setIsDragging(false);

  if (!media) return null;

  if (media.type === 'video') {
    return (
      <div className="relative group w-full h-full flex flex-col justify-center bg-black/5 rounded-lg overflow-hidden" onClick={(e) => { e.stopPropagation(); togglePlay(e); }}>
        <video 
          ref={videoRef}
          src={`http://localhost:5000${media.streamUrl}`} 
          className="max-h-full max-w-full object-contain mx-auto"
          autoPlay 
          loop 
          playsInline
          muted={muted}
          onTimeUpdate={handleTimeUpdate}
        />
        {/* Progress overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 z-10">
          <div 
            className="w-full h-2 bg-white/30 rounded cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-end">
            <button onClick={toggleMute} className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition backdrop-blur">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative group w-full h-full flex items-center justify-center overflow-hidden bg-black/5 rounded-lg"
      onClick={(e) => { e.stopPropagation(); if (onClick) onClick(e); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img 
        src={`http://localhost:5000${media.streamUrl}`} 
        alt={media.name} 
        className="max-h-full max-w-full object-contain transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        draggable="false"
      />
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={handleZoomOut} disabled={zoom <= 1} className="p-2 bg-black/50 hover:bg-black/80 disabled:opacity-50 text-white rounded-full backdrop-blur transition">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={handleZoomIn} disabled={zoom >= 4} className="p-2 bg-black/50 hover:bg-black/80 disabled:opacity-50 text-white rounded-full backdrop-blur transition">
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
