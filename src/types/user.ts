export type UserRole = 'admin' | 'professional' | 'pending_professional' | 'client';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
  profilePhotoUrl?: string;
  role: UserRole;
  phoneNumber?: string;
  bio?: string;
  location?: string | LocationData;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  professionalProfile?: {
    bio?: string;
    location?: string | LocationData;
    website?: string;
    socialMedia?: {
      instagram?: string;
      tiktok?: string;
    };
    expertise?: string[];
    availability?: string[];
    rating?: number;
    specialties?: string[];
    yearsOfExperience?: number;
    businessHours?: {
      [key: string]: {
        start: string;
        end: string;
      };
    };
    services?: {
      id: string;
      serviceId: string;
      name: string;
      description: string;
      categoryId: string;
      subcategoryId: string;
      basePrice: number;
      baseDuration: number;
      minPrice: number;
      minDuration: number;
      price: number;
      duration: number;
      isAvailable: boolean;
      createdAt: Date | string;
      updatedAt: Date | string;
      imageUrl: string;
      professionalOfferings: any[];
      professionalId: string;
    }[];
    calendarSync?: boolean;
    // Verification fields
    professionalType?: ProfessionalType;
    licenseState?: string;
    licenseNumber?: string;
    licenseExpirationDate?: string;
    verificationTypeOne?: MakeupArtistVerificationType;
    verificationTypeTwo?: MakeupArtistVerificationType;
    submissionDate?: string;
    verification?: {
      status: 'pending' | 'verified' | 'rejected';
      documentType?: string;
      documentId?: string;
      expirationDate?: string;
      verifiedDate?: string;
    };
  };
  membershipTier?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}

export interface LocationData {
  address: string;
  placeId?: string;  // Make placeId optional
  coordinates: {
    lat: number;
    lng: number;
  };
}

import { Service } from '@/types/service';
import { 
  ProfessionalType,
  MakeupArtistVerificationType
} from './professional';

export interface ProfileUpdateData {
  displayName?: string;
  phoneNumber?: string;
  email?: string;
  location?: string | LocationData;
  professionalProfile?: {
    bio?: string;
    location?: string | LocationData;
    website?: string;
    socialMedia?: {
      instagram?: string;
      tiktok?: string;
    };
    expertise?: string[];
    availability?: string[];
    specialties?: string[];
    yearsOfExperience?: number;
    businessHours?: {
      [key: string]: {
        start: string;
        end: string;
      };
    };
    services?: Service[];
    calendarSync?: boolean;
  };
}
