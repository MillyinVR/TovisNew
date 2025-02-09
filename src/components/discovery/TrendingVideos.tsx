import React, { useState } from 'react';
import { VideoCard } from './VideoCard';
import { VideoModal } from './VideoModal';
import { TrendingVideo } from '../../types/discovery';

interface TrendingVideosProps {
  videos: TrendingVideo[];
}

export const TrendingVideos: React.FC<TrendingVideosProps> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<TrendingVideo | null>(null);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Trending Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVideoClick={() => setSelectedVideo(video)}
          />
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </section>
  );
};