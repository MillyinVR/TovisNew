import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { MediaItem } from '../../../types/service';
import { Button } from '../../common/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import MediaGrid from './MediaGrid';
import ProviderMap from '../../shared/ProviderMap';

interface PublicProfileProps {
  userId: string;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ userId }) => {
  const { userProfile } = useAuth();
  const { mediaItems, addMediaItem, likeMediaItem, commentOnMediaItem } = usePortfolio(userId);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showMap, setShowMap] = useState(false);

  const handleLike = async (mediaId: string) => {
    try {
      await likeMediaItem(mediaId);
    } catch (error) {
      console.error('Failed to like media:', error);
    }
  };

  const handleComment = async (mediaId: string, comment: string) => {
    try {
      await commentOnMediaItem(mediaId, comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = (mediaId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/media/${mediaId}`);
    // Show toast notification
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile?.photoURL} />
            <AvatarFallback>{userProfile?.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {userProfile?.displayName}
            </h1>
            <p className="text-gray-500">{userProfile?.bio}</p>
            <div className="mt-2 flex space-x-4">
              <Button variant="ghost" onClick={() => setShowMap(!showMap)}>
                <MapPin className="h-4 w-4 mr-2" />
                Find Providers Near Me
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nearby Providers</h2>
              <Button variant="ghost" onClick={() => setShowMap(false)}>
                Close
              </Button>
            </div>
            <ProviderMap />
          </div>
        </div>
      )}

      {/* Media Content */}
      <Tabs defaultValue="media" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        <TabsContent value="media">
          <MediaGrid 
            mediaItems={mediaItems}
            onSelect={setSelectedMedia}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        </TabsContent>
        <TabsContent value="services">
          {/* Service History Integration */}
          <div className="mt-4">
            {/* Service history component will be rendered here */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedMedia.title}</h2>
              <Button variant="ghost" onClick={() => setSelectedMedia(null)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative aspect-video">
                {selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleLike(selectedMedia.id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {selectedMedia.likes} Likes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const comment = prompt('Enter your comment');
                      if (comment) {
                        handleComment(selectedMedia.id, comment);
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleShare(selectedMedia.id)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Comments</h3>
                  {selectedMedia.comments.map((comment, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{comment.user}: </span>
                      <span>{comment.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
