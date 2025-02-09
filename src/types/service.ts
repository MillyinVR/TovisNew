import { Timestamp, DocumentData } from 'firebase/firestore';

export interface ServiceData extends DocumentData {
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  duration: number;
  isPublished?: boolean;
  media?: Array<{ url: string; type: 'image' | 'video' }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  priceStep?: number;
  durationStep?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  services: string[];
}

export type ServiceCreator = 'admin' | 'professional';

export interface BaseService {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  duration: number;
  price: number;
  status: ServiceStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  professionalId?: string;
  isPublished: boolean;
  media?: ServiceMedia[];
  requirements?: string[];
  cancellationPolicy?: string;
  availability?: ServiceAvailability;
}

export interface ServiceMedia {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

export interface ServiceAvailability {
  daysAvailable: string[];
  timeSlots: {
    start: string;
    end: string;
  }[];
}

export interface AdminService extends BaseService {
  totalBookings: number;
  revenue: number;
  rating: number;
}

export interface ProfessionalService extends Omit<BaseService, 'categoryId'> {
  baseServiceId: string;
  professionalId: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  basePrice: number;
  baseDuration: number;
  imageUrls: string[];
  isActive: boolean;
  baseService?: Service;
  customOptions?: Array<{
    id: string;
    name: string;
    basePrice: number;
    baseDuration: number;
  }>;
  bookings: number;
  earnings: number;
  reviews: number;
  averageRating: number;
}

export interface ClientService extends BaseService {
  professionalName: string;
  professionalAvatar?: string;
  rating: number;
  totalReviews: number;
  isBookmarked: boolean;
}

export type ServiceStatus = 'active' | 'inactive' | 'pending' | 'archived';

export type ServiceView = 'grid' | 'list';

export interface ServiceFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: number;
  rating?: number;
  status?: ServiceStatus;
}

export interface ServiceSort {
  field: keyof BaseService;
  direction: 'asc' | 'desc';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  minPrice: number;
  priceStep: number;
  baseDuration: number;
  minDuration: number;
  duration?: number;
  durationStep: number;
  categoryId: string;
  subcategoryId?: string;
  imageUrls: string[];
  isAvailable: boolean;
  isBaseService: boolean;
  createdBy: ServiceCreator;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  baseServiceId?: string;
  professionalId?: string;
  price?: number;
}
