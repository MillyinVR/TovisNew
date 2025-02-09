import { useState } from 'react';
import { useAftercare } from '../../../hooks/useAftercare';
import { usePortfolio } from '../../../hooks/usePortfolio';
import ServiceHistoryItem from './ServiceHistoryItem.tsx';
import UploadMediaModal from './UploadMediaModal.tsx';
import SearchBar from './SearchBar.tsx';
import type { SearchBarProps } from './SearchBar.tsx';
import { Service, MediaUploadResult } from '../../../types/service';
import { FooterNav } from '../../shared/FooterNav.tsx';

interface MediaUpload {
  file: File;
  caption: string;
}

export default function ServiceHistory() {
  const { summaries: aftercareSummaries, loading, error } = useAftercare('client');
  const { uploadMedia } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const filteredServices = services.filter(service => {
    const query = searchQuery.toLowerCase();
    const dateString = service.date.toISOString().split('T')[0];
    return (
      service.provider.name.toLowerCase().includes(query) ||
      service.service.name.toLowerCase().includes(query) ||
      dateString.includes(query) ||
      (service.rating && service.rating.toString().includes(query))
    );
  });

  const handleUploadMedia = async (
    files: File[], 
    captions: string[], 
    serviceId: string
  ): Promise<void> => {
    try {
      const media: MediaUpload[] = files.map((file, index) => ({
        file,
        caption: captions[index]
      }));

      const results: MediaUploadResult[] = await uploadMedia({
        serviceId,
        media
      });

      setServices(prev => prev.map(service => 
        service.id === serviceId ? {
          ...service,
          media: [
            ...(service.media || []),
            ...results.map((result: MediaUploadResult) => ({
              id: crypto.randomUUID(),
              type: result.type,
              url: result.url,
              title: result.caption || 'Untitled',
              description: result.caption,
              likes: 0,
              comments: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              serviceId: serviceId,
              professionalId: service.professionalId,
              clientId: service.provider.id
            }))
          ]
        } : service
      ));
    } catch (error: unknown) {
      console.error('Failed to upload media:', error);
      if (error instanceof Error) {
        alert(`Upload failed: ${error.message}`);
      } else {
        alert('Upload failed due to an unknown error');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Service History</h1>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {loading && <p>Loading service history...</p>}
      {error && <p className="text-red-500">Error loading service history: {String(error)}</p>}

      <div className="flex-1 overflow-y-auto">
        {filteredServices.map(service => (
          <ServiceHistoryItem
            key={service.id}
            service={service}
            onAddMedia={() => setSelectedService(service.id)}
          />
        ))}
      </div>

      {selectedService && (
        <UploadMediaModal
          isOpen={!!selectedService}
          serviceId={selectedService}
          onClose={() => setSelectedService(null)}
          onUploadSuccess={async (files: File[], captions: string[]) => {
            await handleUploadMedia(files, captions, selectedService);
          }}
        />
      )}
      <FooterNav userType="client" />
    </div>
  );
}
