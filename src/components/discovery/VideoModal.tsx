import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { TrendingVideo } from '../../types/discovery';

interface VideoModalProps {
  video: TrendingVideo;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Cleanup video playback when modal closes
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col"
      onClick={handleBackdropClick}
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-white text-xl font-bold">{video.title}</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-2xl"
          controls
          autoPlay
          loop
          playsInline
          poster={`https://images.unsplash.com/photo-${video.id + 1000}?w=500&h=500&fit=crop`}
        />
      </div>
      <div className="p-4">
        <div className="text-white/80 text-sm">
          {video.views} views • {video.likes} likes
        </div>
        <div className="flex flex-wrap mt-2">
          {video.hashtags.map((tag, index) => (
            <span key={index} className="text-blue-400 text-sm mr-2">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};