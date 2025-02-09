import { Timestamp } from 'firebase/firestore';

export type ProfessionalType = 
  | 'makeup_artist'
  | 'cosmetologist'
  | 'barber'
  | 'esthetician'
  | 'manicurist'
  | 'massage_therapist';

export type VerificationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'update_pending';

import type { Service as BaseServiceType } from '@/types/service';
export type { Service } from '@/types/service';

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
  category?: string;
  tags?: string[];
  likes?: number;
  views?: number;
  createdAt: Date;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  serviceId?: string;
  userId?: string;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  clientPhoto?: string;
  rating: number;
  comment: string;
  images?: string[];
  service: string;
  createdAt: string;
  likes: number;
  verified: boolean;
  response?: string;
}

export interface VerificationDocument {
  type: string;
  url: string;
  name: string;
}

export interface ProfessionalVerification {
  userId: string;
  name: string;
  email: string;
  professionalType: ProfessionalType;
  licenseNumber?: string;
  licenseExpirationDate?: string;
  licenseState?: string;
  licenseImageUrl?: string;
  verificationTypeOne?: MakeupArtistVerificationType;
  verificationTypeTwo?: MakeupArtistVerificationType;
  verificationImageOne?: string;
  verificationImageTwo?: string;
  identificationImageUrl: string;
  verificationStatus: VerificationStatus;
  submissionDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  documents?: VerificationDocument[];
}

export type MakeupArtistVerificationType =
  | 'union_card'
  | 'editorial_credit'
  | 'professional_website'
  | 'paystub'
  | 'social_media'
  | 'linkedin_profile'
  | 'salon_listing'
  | 'reference_letter'
  | 'diploma_certificate';

export const PROFESSIONAL_TYPES: { [key in ProfessionalType]: string } = {
  makeup_artist: 'Makeup Artist',
  cosmetologist: 'Cosmetologist',
  barber: 'Barber',
  esthetician: 'Esthetician',
  manicurist: 'Manicurist',
  massage_therapist: 'Massage Therapist'
};

export const MAKEUP_ARTIST_VERIFICATION_TYPES: { [key in MakeupArtistVerificationType]: string } = {
  union_card: 'Union Card',
  editorial_credit: 'Editorial Page with Name Credit',
  professional_website: 'Self-hosted Professional Website',
  paystub: 'Paystub Noting Profession',
  social_media: 'Social Media Page (1000+ followers, 2% engagement)',
  linkedin_profile: 'LinkedIn Public Profile',
  salon_listing: 'URL Listing on Salon/Concierge Site',
  reference_letter: 'Letter of Reference from Salon',
  diploma_certificate: 'Diploma or Certificate'
};

export interface Location {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

import type { ProfessionalService as ServiceProfessionalService } from '@/types/service';

export interface ProfessionalService {
  id: string;
  baseServiceId: string;
  professionalId: string;
  name: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  basePrice: number;
  baseDuration: number;
  description?: string;
  imageUrls?: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  baseService?: BaseServiceType;
  customOptions?: Array<{
    id: string;
    name: string;
    basePrice: number;
    baseDuration: number;
  }>;
}

export interface ProfessionalProfileUpdateData {
  displayName?: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: string;
  location?: Location;
  professionalProfile?: {
    bio?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      tiktok?: string;
    };
    services?: Array<{
      id: string;
      name: string;
      duration: number;
      price: number;
    }>;
    portfolio?: PortfolioItem[];
  };
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  portfolio?: PortfolioItem[];
}

export interface ProfessionalProfile {
  uid: string;
  displayName: string;
  bio?: string;
  location?: string | Location;
  website?: string;
  offeredServices: BaseServiceType[];
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
    isAdmin: boolean;
    isOwner: boolean;
  };
  verification?: {
    status: 'pending' | 'verified' | 'rejected';
    documentType?: string;
    documentId?: string;
    expirationDate?: string;
    verifiedDate?: string;
  };
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
  };
  expertise?: string[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  businessHours?: {
    [day: string]: {
      open: string;
      close: string;
    }
  };
  lastUpdated?: string;
  rating?: number;
  reviewCount?: number;
  favoriteCount?: number;
  calendarSync?: boolean;
  calendarProvider?: 'google' | 'outlook' | 'apple';
}

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];
