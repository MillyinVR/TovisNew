import { AppointmentStatus } from './appointment';

export interface CalendarEvent {
  id: string;
  start: Date | string;
  end: Date | string;
  title: string;
  type: 'booking' | 'blocked' | 'available';
  clientName?: string;
  service: string;
  serviceName: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  extendedProps?: {
    appointmentId?: string;
    clientId?: string;
    [key: string]: any;
  };
}

export interface TimeSlot {
  id: string;
  start: Date | string;
  end: Date | string;
  title: string;
  type: 'booking' | 'blocked' | 'available';
  clientName?: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'scheduled';
  extendedProps?: {
    appointmentId?: string;
    clientId?: string;
    [key: string]: any;
  };
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    enabled: boolean;
  };
}

export interface CalendarConfig {
  provider: 'google' | 'outlook' | 'apple';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  primaryCalendarId?: string;
}
