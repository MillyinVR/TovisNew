import { useState, useEffect } from 'react';
import { uploadFiles, getPortfolioItems, PortfolioItem } from '@/lib/api/portfolio';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MediaUpload {
  file: File;
  caption: string;
}

interface UsePortfolioReturn {
  portfolioItems: PortfolioItem[];
  uploadMedia: (params: { serviceId: string; media: MediaUpload[]; userId: string }) => Promise<PortfolioItem[]>;
  isLoading: boolean;
  isUploading: boolean;
  error: Error | null;
}

export const usePortfolio = (userId: string, serviceId?: string): UsePortfolioReturn => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch initial portfolio items
  useEffect(() => {
    const fetchInitialItems = async () => {
      try {
        const items = await getPortfolioItems(userId, serviceId);
        setPortfolioItems(items);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialItems();
  }, [userId, serviceId]);

  // Set up real-time updates
  useEffect(() => {
    if (!userId) return;

    const portfolioRef = collection(db, 'portfolio');
    const q = serviceId 
      ? query(portfolioRef, where('userId', '==', userId), where('serviceId', '==', serviceId))
      : query(portfolioRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'image',
          url: data.url,
          thumbnail: data.thumbnail || data.url,
          caption: data.caption || '',
          likes: data.likes || 0,
          views: data.views || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          size: data.size || 0,
          serviceId: data.serviceId || '',
          userId: data.userId || ''
        };
      });
      setPortfolioItems(items);
    });

    return () => unsubscribe();
  }, [userId, serviceId]);

  const uploadMedia = async (params: {
    serviceId: string;
    media: MediaUpload[];
    userId: string;
  }) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const results = await uploadFiles({
        serviceId: params.serviceId,
        files: params.media.map(m => ({
          file: m.file,
          metadata: {
            caption: m.caption
          }
        })),
        userId: params.userId
      });
      return results;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    portfolioItems,
    uploadMedia,
    isLoading,
    isUploading,
    error
  };
};
