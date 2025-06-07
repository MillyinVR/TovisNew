import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { WorkingHours } from '../../types/calendar';

interface CustomWorkingHours {
  date: string;
  start: string;
  end: string;
}

// Get working hours for a professional
export const getWorkingHours = async (professionalId: string): Promise<WorkingHours> => {
  try {
    // Try to get from the new structure first
    const workingHoursRef = doc(db, 'professionals', professionalId, 'settings', 'workingHours');
    const workingHoursDoc = await getDoc(workingHoursRef);
    
    if (!workingHoursDoc.exists()) {
      // Return default working hours if not set
      return {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '17:00', enabled: true },
        saturday: { start: '10:00', end: '15:00', enabled: false },
        sunday: { start: '10:00', end: '15:00', enabled: false },
      };
    }
    
    return workingHoursDoc.data() as WorkingHours;
  } catch (error) {
    console.error('Error fetching working hours:', error);
    throw new Error('Failed to fetch working hours');
  }
};

// Save working hours for a professional
export const saveWorkingHours = async (professionalId: string, workingHours: WorkingHours): Promise<void> => {
  try {
    const workingHoursRef = doc(db, 'professionals', professionalId, 'settings', 'workingHours');
    await setDoc(workingHoursRef, {
      ...workingHours,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving working hours:', error);
    throw new Error('Failed to save working hours');
  }
};

// Get custom working hours for a professional
export const getCustomWorkingHours = async (professionalId: string): Promise<CustomWorkingHours[]> => {
  try {
    const customHoursRef = collection(db, 'professionals', professionalId, 'customWorkingHours');
    const snapshot = await getDocs(customHoursRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.date,
        start: data.start,
        end: data.end,
        id: doc.id
      } as CustomWorkingHours & { id: string };
    });
  } catch (error) {
    console.error('Error fetching custom working hours:', error);
    throw new Error('Failed to fetch custom working hours');
  }
};

// Save custom working hours for a professional
export const saveCustomWorkingHours = async (
  professionalId: string, 
  customHours: CustomWorkingHours[]
): Promise<void> => {
  try {
    // First, delete all existing custom hours
    const customHoursRef = collection(db, 'professionals', professionalId, 'customWorkingHours');
    const snapshot = await getDocs(customHoursRef);
    
    // Delete operations
    const deletePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { deleted: true, updatedAt: serverTimestamp() })
    );
    await Promise.all(deletePromises);
    
    // Add new custom hours
    const addPromises = customHours.map(hours => 
      setDoc(doc(customHoursRef), {
        ...hours,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error saving custom working hours:', error);
    throw new Error('Failed to save custom working hours');
  }
};

// Save a blocked time slot
export const saveBlockedTimeSlot = async (
  professionalId: string,
  timeSlot: {
    title: string;
    start: Date | string;
    end: Date | string;
  }
): Promise<string> => {
  try {
    const blockedTimesRef = collection(db, 'professionals', professionalId, 'timeOff');
    
    const newDocRef = doc(blockedTimesRef);
    await setDoc(newDocRef, {
      ...timeSlot,
      type: 'blocked',
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return newDocRef.id;
  } catch (error) {
    console.error('Error saving blocked time slot:', error);
    throw new Error('Failed to save blocked time slot');
  }
};

// Get blocked time slots for a professional
export const getBlockedTimeSlots = async (professionalId: string): Promise<any[]> => {
  try {
    const blockedTimesRef = collection(db, 'professionals', professionalId, 'timeOff');
    const snapshot = await getDocs(blockedTimesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start: doc.data().start instanceof Timestamp ? doc.data().start.toDate() : doc.data().start,
      end: doc.data().end instanceof Timestamp ? doc.data().end.toDate() : doc.data().end
    }));
  } catch (error) {
    console.error('Error fetching blocked time slots:', error);
    throw new Error('Failed to fetch blocked time slots');
  }
};

// Update a blocked time slot
export const updateBlockedTimeSlot = async (
  professionalId: string,
  timeSlotId: string,
  updates: Partial<{
    title: string;
    start: Date | string;
    end: Date | string;
  }>
): Promise<void> => {
  try {
    const timeSlotRef = doc(db, 'professionals', professionalId, 'timeOff', timeSlotId);
    await updateDoc(timeSlotRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating blocked time slot:', error);
    throw new Error('Failed to update blocked time slot');
  }
};

// Delete a blocked time slot
export const deleteBlockedTimeSlot = async (
  professionalId: string,
  timeSlotId: string
): Promise<void> => {
  try {
    const timeSlotRef = doc(db, 'professionals', professionalId, 'timeOff', timeSlotId);
    await updateDoc(timeSlotRef, {
      deleted: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting blocked time slot:', error);
    throw new Error('Failed to delete blocked time slot');
  }
};
