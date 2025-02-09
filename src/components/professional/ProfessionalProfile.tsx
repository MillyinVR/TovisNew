import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useProfessionalData } from '../../hooks/useProfessionalData';
import { useServiceManagement } from '../../hooks/useServiceManagement';
import { FooterNav } from '../shared/FooterNav';
import { ProfessionalService, Review, ProfessionalProfile as ProfessionalProfileType, PortfolioItem } from '../../types/professional';
import { ServicesSection } from './profile/sections/ServicesSections';
import { 
  Star,
  Share2,
  Heart,
  ChevronLeft,
  Bell,
  Grid,
  List,
  MapPin,
  Instagram,
  Youtube,
  ChevronDown,
  Twitter,
  Edit,
  Plus,
  X,
  Upload
} from 'lucide-react';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-sm font-medium text-center ${
      isActive
        ? 'text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    aria-label={label}
  >
    {label}
  </button>
);

type TabType = 'portfolio' | 'services' | 'reviews';

export const ProfessionalProfile = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile, reviews, services, loading: profileLoading, error: profileError } = useProfessionalData(id || '');
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const isProfessionalViewingOwnProfile = userProfile?.uid === id;
  const professionalProfile = profile?.professionalProfile || {};

  const { portfolioItems, isLoading: portfolioLoading, uploadMedia, error: portfolioError } = usePortfolio(id || '');
  const { loading: servicesLoading } = useServiceManagement();

  const stats = {
    rating: professionalProfile?.rating || 0,
    reviews: reviews?.length || 0,
    favorites: professionalProfile?.favoriteCount || 0
  };

  const isLoading = portfolioLoading || profileLoading;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white px-4 py-2 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">{profile?.displayName || ''}</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className="p-2"
          >
            <Heart className={`h-6 w-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
          <button className="p-2">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white pb-4 px-4 pt-20">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={profile?.photoURL || ''}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          
          <h2 className="mt-4 text-xl font-semibold">{profile?.displayName || ''}</h2>
          <p className="text-gray-600">{professionalProfile?.bio || ''}</p>
          
          <div className="flex items-center mt-2 text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <a 
              href={
                typeof professionalProfile?.location === 'string'
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(professionalProfile.location)}`
                  : professionalProfile?.location?.coordinates
                    ? `https://www.google.com/maps?q=${professionalProfile.location.coordinates.lat},${professionalProfile.location.coordinates.lng}`
                    : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 hover:underline"
            >
              {typeof professionalProfile?.location === 'string' 
                ? professionalProfile.location 
                : professionalProfile?.location?.address || ''}
            </a>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mt-6 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold">{stats.rating}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.reviews}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.favorites}</div>
              <div className="text-sm text-gray-500">Favorites</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center space-x-3 px-4 mt-4">
            <button className="bg-indigo-600 text-white py-2 px-8 rounded-full font-medium hover:bg-indigo-700">
              Book
            </button>
            <button className="bg-indigo-600 text-white py-2 px-8 rounded-full font-medium hover:bg-indigo-700">
              Chat
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowSocialMenu(!showSocialMenu)}
                className="bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
              
              {/* Social Menu Dropdown */}
              {showSocialMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[60]">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Share2 className="h-4 w-4 mr-3" />
                    Share Profile
                  </button>
                  <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Instagram className="h-4 w-4 mr-3" />
                    Instagram
                  </a>
                  <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Youtube className="h-4 w-4 mr-3" />
                    YouTube
                  </a>
                  <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Twitter className="h-4 w-4 mr-3" />
                    X (Twitter)
                  </a>
                </div>
              )}
            </div>
          </div>

          {isProfessionalViewingOwnProfile && (
            <button 
              onClick={() => navigate('/professional/profile/edit')}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-full flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="flex">
          <Tab
            label="Portfolio"
            isActive={activeTab === 'portfolio'}
            onClick={() => setActiveTab('portfolio')}
          />
          <Tab
            label="Services"
            isActive={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
          />
          <Tab
            label="Reviews"
            isActive={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 pb-20">
        {activeTab === 'portfolio' && (
          <div>
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              {isProfessionalViewingOwnProfile && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </button>
              )}
              <div className="bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {portfolioError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {typeof portfolioError === 'string' 
                        ? portfolioError 
                        : portfolioError instanceof Error 
                          ? portfolioError.message 
                          : 'An error occurred'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-1' : 'space-y-4'}>
              {portfolioItems?.map((item, index) => {
                const portfolioItem = item as PortfolioItem;
                return (
                  <div key={portfolioItem.id} className={viewMode === 'grid' ? 'aspect-square' : 'w-full'}>
                    <img
                      src={portfolioItem.url}
                      alt={portfolioItem.caption || `Portfolio item ${index + 1}`}
                      className={`${
                        viewMode === 'grid'
                          ? 'w-full h-full object-cover'
                          : 'w-full h-48 object-cover rounded-lg'
                      }`}
                    />
                    {viewMode === 'list' && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">{portfolioItem.caption}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>{portfolioItem.likes} likes</span>
                          <span className="mx-1">•</span>
                          <span>{portfolioItem.views} views</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <ServicesSection 
            profileId={id || ''} 
            permissions={{ canEdit: isProfessionalViewingOwnProfile }} 
          />
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="ml-3">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded mt-4"></div>
                    <div className="h-3 bg-gray-200 rounded mt-2 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : profileError ? (
              <div className="text-center text-red-500">
                Error loading reviews: {profileError instanceof Error ? profileError.message : typeof profileError === 'string' ? profileError : 'Unknown error'}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-gray-500">
                No reviews available
              </div>
            ) : (
              reviews.map((review: Review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <img
                      src={review.clientPhoto || ''}
                      alt={review.clientName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{review.clientName}</div>
                      <div className="flex items-center text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600 text-sm">
                    {review.comment}
                  </p>
                  {review.response && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Response: </span>
                        {review.response}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <FooterNav userType="professional" />

      {/* Click outside handler for social menu */}
      {showSocialMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowSocialMenu(false)}
        />
      )}


      {/* Portfolio Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Portfolio Item</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
    e.preventDefault();
    if (!selectedFile || !userProfile?.uid) return;

    try {
      setUploadLoading(true);
      await uploadMedia({
        serviceId: 'current-service', // TODO: Replace with actual service ID
        media: [{
          file: selectedFile,
          caption: caption
        }],
        userId: userProfile.uid
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setCaption('');
      setCategory('');
      setTags([]);
    } catch (error) {
      console.error('Failed to upload portfolio item:', error);
    } finally {
      setUploadLoading(false);
    }
            }} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {selectedFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                  Caption
                </label>
                <input
                  type="text"
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="makeup">Makeup</option>
                  <option value="hair">Hair</option>
                  <option value="nails">Nails</option>
                  <option value="skincare">Skincare</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Press Enter to add tags"
                />
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const tagToRemove = tag;
                            setTags(tags.filter(t => t !== tagToRemove));
                          }}
                          className="ml-1 text-indigo-600 hover:text-indigo-900"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
