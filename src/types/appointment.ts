export enum AppointmentStatus {
  REQUESTED = 'REQUESTED',
  PENDING = 'PENDING',
  PREBOOKED = 'PREBOOKED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TimeSlot {
  id: string;
  start: Date | string;
  end: Date | string;
  title: string;
  type: 'booking' | 'break' | 'unavailable' | 'available' | 'blocked';
  status: 'available' | 'booked' | 'pending' | 'scheduled';
  service?: string;
  professionalId?: string;
  clientName?: string;
  extendedProps?: {
    appointmentId?: string;
    [key: string]: any;
  };
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  service: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  productsUsed?: string[];
  beforeImage?: string;
  afterImage?: string;
  calendarSync?: boolean;
  statusReason?: string;
}
