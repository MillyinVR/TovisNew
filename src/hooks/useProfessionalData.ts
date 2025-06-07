import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProfessionalProfile, Service as BaseServiceType } from '../types/professional';
import { Service } from '../types/service';

// Extended interface for professionals with distance
interface ProfessionalWithDistance extends ProfessionalProfile {
  distance?: number | null;
}

interface UseProfessionalDataProps {
  professionalId?: string;
  includeServices?: boolean;
  includePortfolio?: boolean;
  includeWorkingHours?: boolean;
}

interface UseProfessionalDataReturn {
  loading: boolean;
  error: Error | null;
  professionalData: ProfessionalProfile | null;
  services: Service[];
  portfolio: any[];
  workingHours: any;
  refreshData: () => Promise<void>;
}

/**
 * Hook to fetch professional data from the new database structure
 * This demonstrates how to use the new professionals collection
 */
export const useProfessionalData = ({
  professionalId,
  includeServices = true,
  includePortfolio = true,
  includeWorkingHours = false
}: UseProfessionalDataProps): UseProfessionalDataReturn => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [professionalData, setProfessionalData] = useState<ProfessionalProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [workingHours, setWorkingHours] = useState<any>(null);

  // Use the provided professionalId or the current user's ID
  const targetProfessionalId = professionalId || currentUser?.uid;

  const fetchProfessionalData = useCallback(async () => {
    if (!targetProfessionalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch professional data from the professionals collection
      const professionalRef = doc(db, 'professionals', targetProfessionalId);
      const professionalDoc = await getDoc(professionalRef);

      if (!professionalDoc.exists()) {
        // If not found in professionals collection, try the legacy users collection
        const userRef = doc(db, 'users', targetProfessionalId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setError(new Error('Professional not found'));
          setLoading(false);
          return;
        }

        // Convert legacy user data to professional profile
        const userData = userDoc.data();
        if (userData.role !== 'professional' && userData.role !== 'pending_professional') {
          setError(new Error('User is not a professional'));
          setLoading(false);
          return;
        }

        // Create professional profile from legacy user data
        const profile: ProfessionalProfile = {
          uid: targetProfessionalId,
          displayName: userData.displayName || userData.name || '',
          bio: userData.professionalProfile?.bio || '',
          location: userData.location || userData.professionalProfile?.location,
          website: userData.professionalProfile?.website || '',
          offeredServices: [] as BaseServiceType[],
          permissions: {
            canEdit: currentUser?.uid === targetProfessionalId,
            canDelete: currentUser?.uid === targetProfessionalId,
            canManage: currentUser?.uid === targetProfessionalId,
            isAdmin: currentUser?.role === 'admin',
            isOwner: currentUser?.uid === targetProfessionalId
          },
          verification: userData.professionalProfile?.verification || {
            status: 'pending'
          },
          socialMedia: userData.professionalProfile?.socialMedia || {},
          expertise: userData.professionalProfile?.expertise || [],
          rating: userData.professionalProfile?.rating || 0,
          reviewCount: 0,
          favoriteCount: 0
        };

        setProfessionalData(profile);

        // Fetch services from legacy structure
        if (includeServices) {
          const servicesRef = collection(db, 'users', targetProfessionalId, 'services');
          const servicesSnapshot = await getDocs(servicesRef);
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          setServices(servicesData);
        }

        // Fetch portfolio from legacy structure
        if (includePortfolio) {
          const portfolioRef = query(
            collection(db, 'portfolio'),
            where('professionalId', '==', targetProfessionalId)
          );
          const portfolioSnapshot = await getDocs(portfolioRef);
          const portfolioData = portfolioSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPortfolio(portfolioData);
        }

        // Fetch working hours from legacy structure
        if (includeWorkingHours) {
          const workingHoursRef = doc(db, 'users', targetProfessionalId, 'settings', 'workingHours');
          const workingHoursDoc = await getDoc(workingHoursRef);
          if (workingHoursDoc.exists()) {
            setWorkingHours(workingHoursDoc.data());
          }
        }
      } else {
        // Use data from the new professionals collection
        const professionalData = professionalDoc.data();
        
        // Create professional profile from new structure
        const profile: ProfessionalProfile = {
          uid: targetProfessionalId,
          displayName: professionalData.displayName || professionalData.name || '',
          bio: professionalData.bio || '',
          location: professionalData.location,
          website: professionalData.website || '',
          offeredServices: [],
          permissions: {
            canEdit: currentUser?.uid === targetProfessionalId,
            canDelete: currentUser?.uid === targetProfessionalId,
            canManage: currentUser?.uid === targetProfessionalId,
            isAdmin: currentUser?.role === 'admin',
            isOwner: currentUser?.uid === targetProfessionalId
          },
          verification: professionalData.verification || {
            status: professionalData.verificationStatus || 'pending'
          },
          socialMedia: professionalData.socialMedia || {},
          expertise: professionalData.expertise || [],
          rating: professionalData.rating || 0,
          reviewCount: professionalData.reviewCount || 0,
          favoriteCount: professionalData.favoriteCount || 0
        };

        setProfessionalData(profile);

        // Fetch services from new structure
        if (includeServices) {
          const servicesRef = collection(db, 'professionals', targetProfessionalId, 'services');
          const servicesSnapshot = await getDocs(servicesRef);
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          setServices(servicesData);
        }

        // Fetch portfolio from new structure
        if (includePortfolio) {
          const portfolioRef = collection(db, 'professionals', targetProfessionalId, 'portfolio');
          const portfolioSnapshot = await getDocs(portfolioRef);
          const portfolioData = portfolioSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPortfolio(portfolioData);
        }

        // Fetch working hours from new structure
        if (includeWorkingHours) {
          const workingHoursRef = collection(db, 'professionals', targetProfessionalId, 'workingHours');
          const workingHoursSnapshot = await getDocs(workingHoursRef);
          
          if (!workingHoursSnapshot.empty) {
            const workingHoursData: Record<string, any> = {};
            workingHoursSnapshot.docs.forEach(doc => {
              workingHoursData[doc.id] = doc.data();
            });
            setWorkingHours(workingHoursData);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching professional data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch professional data'));
    } finally {
      setLoading(false);
    }
  }, [targetProfessionalId, currentUser, includeServices, includePortfolio, includeWorkingHours]);

  useEffect(() => {
    fetchProfessionalData();
  }, [fetchProfessionalData]);

  return {
    loading,
    error,
    professionalData,
    services,
    portfolio,
    workingHours,
    refreshData: fetchProfessionalData
  };
};

/**
 * Hook to fetch nearby professionals based on location
 * This demonstrates how to use the new geoIndex collection
 */
export const useNearbyProfessionals = (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  serviceId?: string,
  limit: number = 10
) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalWithDistance[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Generate geohash for the given coordinates
  const generateGeohash = useCallback((lat: number, lng: number, precision: number = 5): string => {
    // This is a simplified version - in production, use a proper geohash library
    const latInt = Math.floor((lat + 90) * 1000000);
    const lngInt = Math.floor((lng + 180) * 1000000);
    
    // Convert to binary strings and pad to 32 bits
    const latBin = latInt.toString(2).padStart(32, '0');
    const lngBin = lngInt.toString(2).padStart(32, '0');
    
    // Interleave bits from lat and lng
    let geohashBin = '';
    for (let i = 0; i < precision * 5; i++) {
      geohashBin += (i % 2 === 0) ? lngBin[Math.floor(i/2)] : latBin[Math.floor(i/2)];
    }
    
    // Convert 5-bit chunks to base32 characters
    const base32Chars = '0123456789bcdefghjkmnpqrstuvwxyz';
    let geohash = '';
    
    // Process 5 bits at a time
    for (let i = 0; i < geohashBin.length; i += 5) {
      const chunk = geohashBin.substring(i, i + 5);
      
      // Manual binary to decimal conversion
      let value = 0;
      for (let j = 0; j < chunk.length; j++) {
        if (chunk[j] === '1') {
          value += 1 << (chunk.length - j - 1);
        }
      }
      
      geohash += base32Chars[value];
    }
    
    return geohash;
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const earthRadiusKm = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return earthRadiusKm * c;
  }, []);

  // Fetch nearby professionals
  const fetchNearbyProfessionals = useCallback(async () => {
    if (!latitude || !longitude) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get geohash for the current location
      const geohash = generateGeohash(latitude, longitude);
      
      // Query the geoIndex collection
      let geoQuery = query(
        collection(db, 'geoIndex'),
        // Use a prefix match for the geohash to find nearby areas
        where('__name__', '>=', geohash.substring(0, 3)),
        where('__name__', '<=', geohash.substring(0, 3) + '\uf8ff'),
        firestoreLimit(5) // Limit the number of geohash areas to check
      );
      
      const geoSnapshot = await getDocs(geoQuery);
      
      if (geoSnapshot.empty) {
        setProfessionals([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Collect all professional IDs from the matching geohash areas
      let professionalIds: string[] = [];
      
      geoSnapshot.docs.forEach(doc => {
        const geoData = doc.data();
        
        // If filtering by service, only include professionals offering that service
        if (serviceId && geoData.serviceIds) {
          if (geoData.serviceIds.includes(serviceId)) {
            professionalIds = [...professionalIds, ...geoData.professionalIds];
          }
        } else {
          professionalIds = [...professionalIds, ...geoData.professionalIds];
        }
      });
      
      // Remove duplicates
      professionalIds = [...new Set(professionalIds)];
      
      if (professionalIds.length === 0) {
        setProfessionals([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Fetch professional data for each ID
      let professionalsData: ProfessionalWithDistance[] = [];
      
      // Use batching to limit the number of reads
      const batchSize = 10;
      for (let i = 0; i < Math.min(professionalIds.length, limit); i += batchSize) {
        const batch = professionalIds.slice(i, i + batchSize);
        
        // Query the professionals collection
        const professionalsQuery = query(
          collection(db, 'professionals'),
          where('__name__', 'in', batch)
        );
        
        const professionalsSnapshot = await getDocs(professionalsQuery);
        
        // Convert to ProfessionalProfile objects and calculate distance
        const batchData = professionalsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calculate distance if location is available
          let distance = null;
          if (data.location?.coordinates?.lat && data.location?.coordinates?.lng) {
            distance = calculateDistance(
              latitude,
              longitude,
              data.location.coordinates.lat,
              data.location.coordinates.lng
            );
          }
          
          return {
            uid: doc.id,
            displayName: data.displayName || data.name || '',
            bio: data.bio || '',
            location: data.location,
            website: data.website || '',
            offeredServices: [],
            permissions: {
              canEdit: false,
              canDelete: false,
              canManage: false,
              isAdmin: false,
              isOwner: false
            },
            verification: data.verification || {
              status: data.verificationStatus || 'pending'
            },
            socialMedia: data.socialMedia || {},
            expertise: data.expertise || [],
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            favoriteCount: data.favoriteCount || 0,
            distance // Add distance to the object
          } as ProfessionalProfile & { distance: number | null };
        });
        
        professionalsData = [...professionalsData, ...batchData];
      }
      
      // Filter by distance
      professionalsData = professionalsData
        .filter(prof => prof.distance !== null && prof.distance !== undefined && prof.distance <= radiusKm)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      
      setProfessionals(professionalsData);
      setHasMore(professionalsData.length === limit);
      
      // Set the last document for pagination
      if (professionalsData.length > 0) {
        const lastProfessionalId = professionalsData[professionalsData.length - 1].uid;
        const lastProfessionalDoc = await getDoc(doc(db, 'professionals', lastProfessionalId));
        setLastDoc(lastProfessionalDoc as QueryDocumentSnapshot<DocumentData>);
      } else {
        setLastDoc(null);
      }
    } catch (err) {
      console.error('Error fetching nearby professionals:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch nearby professionals'));
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm, serviceId, limit, generateGeohash, calculateDistance]);

  // Load more professionals
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDoc || loading) {
      return;
    }

    setLoading(true);
    
    try {
      // Similar logic as fetchNearbyProfessionals but with startAfter
      // Implementation depends on how you want to handle pagination
      // This is a simplified example
      
      // For demonstration, we'll just fetch the next batch of professionals
      const nextProfessionalsQuery = query(
        collection(db, 'professionals'),
        orderBy('__name__'),
        startAfter(lastDoc),
        firestoreLimit(limit)
      );
      
      const nextProfessionalsSnapshot = await getDocs(nextProfessionalsQuery);
      
      if (nextProfessionalsSnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const nextProfessionalsData = nextProfessionalsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          uid: doc.id,
          displayName: data.displayName || data.name || '',
          bio: data.bio || '',
          location: data.location,
          website: data.website || '',
          offeredServices: [],
          permissions: {
            canEdit: false,
            canDelete: false,
            canManage: false,
            isAdmin: false,
            isOwner: false
          },
          verification: data.verification || {
            status: data.verificationStatus || 'pending'
          },
          socialMedia: data.socialMedia || {},
          expertise: data.expertise || [],
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          favoriteCount: data.favoriteCount || 0
        } as ProfessionalProfile;
      });
      
      setProfessionals(prev => [...prev, ...nextProfessionalsData]);
      setHasMore(nextProfessionalsData.length === limit);
      
      // Set the last document for pagination
      if (nextProfessionalsData.length > 0) {
        setLastDoc(nextProfessionalsSnapshot.docs[nextProfessionalsSnapshot.docs.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (err) {
      console.error('Error loading more professionals:', err);
      setError(err instanceof Error ? err : new Error('Failed to load more professionals'));
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastDoc, loading, limit]);

  useEffect(() => {
    fetchNearbyProfessionals();
  }, [fetchNearbyProfessionals]);

  return {
    loading,
    error,
    professionals,
    hasMore,
    loadMore,
    refreshData: fetchNearbyProfessionals
  };
};

/**
 * Hook to fetch trending content for "The Looks" feature
 * This demonstrates how to use the new theLooks collection
 */
export const useTrendingContent = (
  categoryId?: string,
  region: string = 'all',
  limitCount: number = 20
) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Fetch trending content
  const fetchTrendingContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query for theLooks collection
      let trendingQuery = query(
        collection(db, 'theLooks'),
        orderBy('trendingScore', 'desc')
      );
      
      // Add category filter if provided
      if (categoryId) {
        trendingQuery = query(
          trendingQuery,
          where('categoryId', '==', categoryId)
        );
      }
      
      // Add region filter if not 'all'
      if (region !== 'all') {
        trendingQuery = query(
          trendingQuery,
          where('region', '==', region)
        );
      }
      
      // Add limit
      trendingQuery = query(
        trendingQuery,
        firestoreLimit(limitCount)
      );
      
      const trendingSnapshot = await getDocs(trendingQuery);
      
      if (trendingSnapshot.empty) {
        setContent([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Get content IDs from theLooks
      const contentIds = trendingSnapshot.docs.map(doc => doc.data().contentId);
      
      // Fetch actual content data
      const contentData = await Promise.all(
        contentIds.map(async (contentId) => {
          const contentDoc = await getDoc(doc(db, 'content', contentId));
          if (contentDoc.exists()) {
            return {
              id: contentDoc.id,
              ...contentDoc.data(),
              trendingScore: trendingSnapshot.docs.find(
                doc => doc.data().contentId === contentId
              )?.data().trendingScore || 0
            };
          }
          return null;
        })
      );
      
      // Filter out null values and sort by trending score
      const validContent = contentData
        .filter(Boolean)
        .sort((a, b) => (b?.trendingScore ?? 0) - (a?.trendingScore ?? 0));
      
      setContent(validContent);
      setHasMore(validContent.length === limitCount);
      
      // Set the last document for pagination
      if (trendingSnapshot.docs.length > 0) {
        setLastDoc(trendingSnapshot.docs[trendingSnapshot.docs.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (err) {
      console.error('Error fetching trending content:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trending content'));
    } finally {
      setLoading(false);
    }
  }, [categoryId, region, limitCount]);

  // Load more content
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDoc || loading) {
      return;
    }

    setLoading(true);
    
    try {
      // Build query for theLooks collection with startAfter
      let nextTrendingQuery = query(
        collection(db, 'theLooks'),
        orderBy('trendingScore', 'desc'),
        startAfter(lastDoc)
      );
      
      // Add category filter if provided
      if (categoryId) {
        nextTrendingQuery = query(
          nextTrendingQuery,
          where('categoryId', '==', categoryId)
        );
      }
      
      // Add region filter if not 'all'
      if (region !== 'all') {
        nextTrendingQuery = query(
          nextTrendingQuery,
          where('region', '==', region)
        );
      }
      
      // Add limit
      nextTrendingQuery = query(
        nextTrendingQuery,
        firestoreLimit(limitCount)
      );
      
      const nextTrendingSnapshot = await getDocs(nextTrendingQuery);
      
      if (nextTrendingSnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // Get content IDs from theLooks
      const nextContentIds = nextTrendingSnapshot.docs.map(doc => doc.data().contentId);
      
      // Fetch actual content data
      const nextContentData = await Promise.all(
        nextContentIds.map(async (contentId) => {
          const contentDoc = await getDoc(doc(db, 'content', contentId));
          if (contentDoc.exists()) {
            return {
              id: contentDoc.id,
              ...contentDoc.data(),
              trendingScore: nextTrendingSnapshot.docs.find(
                doc => doc.data().contentId === contentId
              )?.data().trendingScore || 0
            };
          }
          return null;
        })
      );
      
      // Filter out null values and sort by trending score
      const nextValidContent = nextContentData
        .filter(Boolean)
        .sort((a, b) => (b?.trendingScore ?? 0) - (a?.trendingScore ?? 0));
      
      setContent(prev => [...prev, ...nextValidContent]);
      setHasMore(nextValidContent.length === limitCount);
      
      // Set the last document for pagination
      if (nextTrendingSnapshot.docs.length > 0) {
        setLastDoc(nextTrendingSnapshot.docs[nextTrendingSnapshot.docs.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (err) {
      console.error('Error loading more content:', err);
      setError(err instanceof Error ? err : new Error('Failed to load more content'));
    } finally {
      setLoading(false);
    }
  }, [hasMore, lastDoc, loading, categoryId, region, limitCount]);

  useEffect(() => {
    fetchTrendingContent();
  }, [fetchTrendingContent]);

  return {
    loading,
    error,
    content,
    hasMore,
    loadMore,
    refreshData: fetchTrendingContent
  };
};
