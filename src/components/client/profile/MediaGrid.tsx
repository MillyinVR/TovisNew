import React from 'react';
import { MediaItem } from '../../../types/service';

interface MediaGridProps {
  mediaItems: MediaItem[];
  onSelect: (media: MediaItem) => void;
  onLike: (mediaId: string) => void;
  onComment: (mediaId: string, comment: string) => void;
  onShare: (mediaId: string) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  mediaItems,
  onSelect,
  onLike,
  onComment,
  onShare
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaItems.map((media) => (
        <div
          key={media.id}
          className="relative aspect-square cursor-pointer"
          onClick={() => onSelect(media)}
        >
          {media.type === 'video' ? (
            <video
              src={media.url}
              className="w-full h-full object-cover rounded-lg"
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-200" />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <button
              className="flex items-center px-2 py-1 bg-white/90 rounded-full text-sm hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onLike(media.id);
              }}
            >
              <span>{media.likes}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
