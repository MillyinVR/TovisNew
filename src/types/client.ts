export interface ClientProfile {
  id: string;
  displayName: string;
  photoURL: string | null;
  email: string;
  phoneNumber: string | null;
  preferences: {
    skinType?: string;
    hairType?: string;
    allergies?: string[];
    sensitivities?: string[];
    preferredProducts?: string[];
    stylePreferences?: string[];
    communicationPreferences?: {
      reminders: boolean;
      method: 'email' | 'sms' | 'both';
      frequency: 'day_before' | 'hours_before' | 'week_before';
    };
  };
  serviceHistory: ServiceRecord[];
  professionalNotes: ProfessionalNote[];
  reviews: ClientReview[];
  flags?: {
    noShow?: number;
    lateCancel?: number;
    paymentIssues?: number;
  };
  lastUpdated: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  notes?: string;
  products?: string[];
  images?: string[];
  followUpRequired?: boolean;
}

export interface ProfessionalNote {
  id: string;
  professionalId: string;
  professionalName: string;
  date: string;
  note: string;
  type: 'general' | 'medical' | 'preference' | 'warning';
  visibility: 'private' | 'shared';
}

export interface ClientReview {
  id: string;
  professionalId: string;
  professionalName: string;
  date: string;
  rating: number;
  comment: string;
  serviceId: string;
  serviceName: string;
  images?: string[];
  response?: {
    date: string;
    comment: string;
  };
}