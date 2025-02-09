export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  usage: string;
  inStock: boolean;
}

export interface ServiceSummary {
  id: string;
  name: string;
  price: number;
  nextAppointmentRecommendation: {
    timeframe: number; // in weeks
    reason: string;
  };
}

export interface AftercareImage {
  url: string;
  caption?: string;
}

export interface AftercareSummary {
  id: string;
  clientId: string;
  professionalId: string;
  serviceName: string;
  providerName: string;
  date: string;
  beforeImages: AftercareImage[];
  afterImages: AftercareImage[];
  services: ServiceSummary[];
  recommendedProducts: Product[];
  aftercareInstructions: string[];
  notes: string;
  status: 'draft' | 'sent' | 'viewed' | 'confirmed';
  reviewSubmitted: boolean;
  productsOrdered: string[]; // Array of product IDs
  nextAppointmentBooked: boolean;
  rating?: number;
}

export interface Review {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string;
  beforeImage?: string;
  afterImage?: string;
  additionalImages: string[];
  createdAt: string;
  status: 'published' | 'hidden' | 'flagged';
}
