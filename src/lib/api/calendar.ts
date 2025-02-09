import { Appointment, TimeSlot } from '../../types/appointment';
import { CalendarEvent } from '../../types/calendar';
import { getFirestore, collection, doc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface InternalCalendarService {
  init(): Promise<void>;
  syncAppointments(appointments: Appointment[]): Promise<void>;
  getTimeSlots(start: Date, end: Date): Promise<TimeSlot[]>;
  getProfessionalAppointments(professionalId: string): Promise<CalendarEvent[]>;
  updateAppointmentTime(appointmentId: string, newTime: Date): Promise<void>;
}

class InternalCalendar implements InternalCalendarService {
  async init(): Promise<void> {
    // No initialization needed for internal calendar
  }

  async syncAppointments(appointments: Appointment[]): Promise<void> {
    // Sync appointments with our database
    const appointmentsCollection = collection(db, 'appointments');
    
    for (const appointment of appointments) {
      await setDoc(doc(appointmentsCollection, appointment.id), {
        ...appointment,
        syncedAt: new Date()
      });
    }
  }

  async getTimeSlots(start: Date, end: Date): Promise<TimeSlot[]> {
    // Get available time slots from our database
    const timeSlotsCollection = collection(db, 'timeSlots');
    const q = query(
      timeSlotsCollection,
      where('start', '>=', start),
      where('end', '<=', end)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as TimeSlot);
  }

  async getProfessionalAppointments(professionalId: string): Promise<CalendarEvent[]> {
    // Get professional's appointments from our database
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(
      appointmentsCollection,
      where('professionalId', '==', professionalId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as CalendarEvent);
  }

  async updateAppointmentTime(appointmentId: string, newTime: Date): Promise<void> {
    // Update appointment time in our database
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      startTime: newTime
    });
  }
}

export const syncProfessionalCalendar = async (professionalId: string): Promise<CalendarEvent[]> => {
  const calendar = new InternalCalendar();
  await calendar.init();
  return calendar.getProfessionalAppointments(professionalId);
};

export const calendarService = {
  provider: null as InternalCalendarService | null,

  async initInternal(): Promise<void> {
    this.provider = new InternalCalendar();
    await this.provider.init();
  },

  async syncAppointments(appointments: Appointment[]): Promise<void> {
    if (!this.provider) {
      throw new Error('Calendar service not initialized');
    }
    await this.provider.syncAppointments(appointments);
  },

  async getTimeSlots(start: Date, end: Date): Promise<TimeSlot[]> {
    if (!this.provider) {
      throw new Error('Calendar service not initialized');
    }
    return this.provider.getTimeSlots(start, end);
  },

  async getProfessionalAppointments(professionalId: string): Promise<CalendarEvent[]> {
    if (!this.provider) {
      throw new Error('Calendar service not initialized');
    }
    return this.provider.getProfessionalAppointments(professionalId);
  },

  async updateAppointmentTime(appointmentId: string, newTime: Date): Promise<void> {
    if (!this.provider) {
      throw new Error('Calendar service not initialized');
    }
    await this.provider.updateAppointmentTime(appointmentId, newTime);
  }
};
