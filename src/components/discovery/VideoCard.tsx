import React, { useRef, useState } from 'react';
import { Heart, BookmarkPlus } from 'lucide-react';
import { TrendingVideo } from '../../types/discovery';

interface VideoCardProps {
  video: TrendingVideo;
  onVideoClick: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onVideoClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Video preview autoplay prevented');
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div
        className="relative h-48 cursor-pointer"
        onClick={onVideoClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover"
          loop
          muted
          playsInline
          poster={`https://images.unsplash.com/photo-${video.id + 1000}?w=500&h=500&fit=crop`}
        />
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-200 hover:bg-black/10" />
        <div className="absolute bottom-2 right-2 flex space-x-2">
          <button 
            className="flex items-center px-2 py-1 bg-white/90 rounded-full text-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle like action
            }}
          >
            <Heart className="h-4 w-4 mr-1" />
            {video.likes}
          </button>
          <button 
            className="p-1 bg-white/90 rounded-full hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle save action
            }}
          >
            <BookmarkPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1">{video.title}</h4>
        <p className="text-xs text-gray-500">{video.views} views</p>
        <div className="flex flex-wrap mt-2">
          {video.hashtags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs text-blue-500 mr-2 hover:text-blue-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                // Handle hashtag click
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};