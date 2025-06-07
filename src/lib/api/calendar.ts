import { Appointment, TimeSlot } from '../../types/appointment';
import { CalendarEvent } from '../../types/calendar';
import { getFirestore, collection, doc, setDoc, updateDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface InternalCalendarService {
  init(): Promise<void>;
  syncAppointments(appointments: Appointment[]): Promise<void>;
  getTimeSlots(start: Date, end: Date, professionalId: string): Promise<TimeSlot[]>;
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

  async getTimeSlots(start: Date, end: Date, professionalId: string): Promise<TimeSlot[]> {
    try {
      // Get available time slots from the professional's settings
      const timeSlotsRef = doc(db, 'professionals', professionalId, 'settings', 'availableTimeSlots');
      const timeSlotsDoc = await getDoc(timeSlotsRef);
      
      if (!timeSlotsDoc.exists()) {
        return [];
      }
      
      const data = timeSlotsDoc.data();
      const allSlots = data.slots || [];
      
      // Filter slots based on the date range
      return allSlots.filter((slot: any) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return slotStart >= start && slotEnd <= end;
      });
    } catch (error) {
      console.error('Error getting time slots:', error);
      return [];
    }
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

// Function to update available time slots based on working hours
export const updateAvailableTimeSlots = async (
  professionalId: string, 
  workingHours: any, 
  customWorkingHours: any[] = [], 
  blockedTimeSlots: any[] = []
): Promise<void> => {
  try {
    console.log('Starting updateAvailableTimeSlots for professional:', professionalId);
    
    // Get reference to the timeSlots document for this professional
    // Using the professionals/{professionalId}/settings path which is permitted in security rules
    console.log('Creating reference to availableTimeSlots document in Firestore');
    const timeSlotsRef = doc(db, 'professionals', professionalId, 'settings', 'availableTimeSlots');
    console.log('Document reference created:', timeSlotsRef.path);
    
    // Generate new time slots based on working hours
    // For the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    console.log('Generating time slots from', startDate, 'to', endDate);
    console.log('Working hours:', workingHours);
    console.log('Custom working hours:', customWorkingHours);
    console.log('Blocked time slots:', blockedTimeSlots);
    
    const timeSlots = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if there's a custom working hour for this date
      const customHour = customWorkingHours.find(h => h.date === dateString);
      
      // If day is enabled in working hours or has custom hours
      if ((workingHours[dayOfWeek]?.enabled || customHour) && !customHour?.disabled) {
        const start = customHour?.start || workingHours[dayOfWeek]?.start || '09:00';
        const end = customHour?.end || workingHours[dayOfWeek]?.end || '17:00';
        
        // Parse start and end times
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        
        // Create time slots in 30-minute increments
        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMinute, 0, 0);
        
        const slotEnd = new Date(currentDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);
        
        // Create 30-minute slots
        while (slotStart < slotEnd) {
          const slotEndTime = new Date(slotStart);
          slotEndTime.setMinutes(slotStart.getMinutes() + 30);
          
          // Check if this slot overlaps with any blocked time
          const isBlocked = blockedTimeSlots.some(blockedSlot => {
            const blockStart = new Date(blockedSlot.start);
            const blockEnd = new Date(blockedSlot.end);
            return (
              (slotStart >= blockStart && slotStart < blockEnd) || 
              (slotEndTime > blockStart && slotEndTime <= blockEnd) ||
              (slotStart <= blockStart && slotEndTime >= blockEnd)
            );
          });
          
          if (!isBlocked) {
            timeSlots.push({
              start: slotStart.toISOString(),
              end: slotEndTime.toISOString(),
              title: 'Available',
              type: 'available',
              status: 'available',
              professionalId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
          
          // Move to next slot
          slotStart.setMinutes(slotStart.getMinutes() + 30);
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Generated ${timeSlots.length} available time slots`);
    
    // Save all time slots as a single document
    console.log('Saving time slots to Firestore...');
    try {
      await setDoc(timeSlotsRef, {
        slots: timeSlots,
        updatedAt: new Date().toISOString()
      });
      console.log('Time slots saved successfully to Firestore');
    } catch (saveError) {
      console.error('Error saving time slots to Firestore:', saveError);
      if (saveError instanceof Error) {
        console.error('Error details:', saveError.message);
        if ('code' in saveError) {
          console.error('Error code:', (saveError as any).code);
        }
      }
      throw saveError;
    }
    
  } catch (error) {
    console.error('Error in updateAvailableTimeSlots:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
    }
    throw new Error('Failed to update available time slots');
  }
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

  async getTimeSlots(start: Date, end: Date, professionalId: string): Promise<TimeSlot[]> {
    if (!this.provider) {
      throw new Error('Calendar service not initialized');
    }
    return this.provider.getTimeSlots(start, end, professionalId);
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
  },
  
  async updateAvailableTimeSlots(
    professionalId: string, 
    workingHours: any, 
    customWorkingHours: any[] = [], 
    blockedTimeSlots: any[] = []
  ): Promise<void> {
    return updateAvailableTimeSlots(professionalId, workingHours, customWorkingHours, blockedTimeSlots);
  }
};
