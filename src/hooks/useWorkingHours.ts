import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WorkingHours } from '../types/calendar';
import {
  getWorkingHours,
  saveWorkingHours,
  getCustomWorkingHours,
  saveCustomWorkingHours,
  getBlockedTimeSlots,
  saveBlockedTimeSlot,
  updateBlockedTimeSlot,
  deleteBlockedTimeSlot
} from '../lib/api/workingHours';
import { calendarService } from '../lib/api/calendar';

interface CustomWorkingHours {
  date: string;
  start: string;
  end: string;
  id?: string;
}

interface BlockedTimeSlot {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  type: 'blocked';
  status: 'scheduled';
}

export const useWorkingHours = () => {
  const { currentUser } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '15:00', enabled: false },
    sunday: { start: '10:00', end: '15:00', enabled: false },
  });
  const [customWorkingHours, setCustomWorkingHours] = useState<CustomWorkingHours[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<BlockedTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load working hours
  const loadWorkingHours = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Loading working hours for professional:', currentUser.uid);
      
      try {
        // Load working hours
        console.log('Fetching working hours from Firestore...');
        const hours = await getWorkingHours(currentUser.uid);
        console.log('Working hours loaded successfully:', hours);
        setWorkingHours(hours);
      } catch (workingHoursError) {
        console.error('Error loading working hours:', workingHoursError);
      }

      try {
        // Load custom working hours
        console.log('Fetching custom working hours from Firestore...');
        const customHours = await getCustomWorkingHours(currentUser.uid);
        console.log('Custom working hours loaded successfully:', customHours);
        setCustomWorkingHours(customHours);
      } catch (customHoursError) {
        console.error('Error loading custom working hours:', customHoursError);
      }

      try {
        // Load blocked time slots
        console.log('Fetching blocked time slots from Firestore...');
        const blockedSlots = await getBlockedTimeSlots(currentUser.uid);
        console.log('Blocked time slots loaded successfully:', blockedSlots);
        setBlockedTimeSlots(blockedSlots);
      } catch (blockedSlotsError) {
        console.error('Error loading blocked time slots:', blockedSlotsError);
      }
      
      try {
        // Update available time slots in the backend
        console.log('Updating available time slots in the backend...');
        await calendarService.updateAvailableTimeSlots(
          currentUser.uid,
          workingHours,
          customWorkingHours,
          blockedTimeSlots
        );
        console.log('Available time slots updated successfully');
      } catch (updateError) {
        console.error('Error updating available time slots:', updateError);
      }
    } catch (err) {
      console.error('Error in loadWorkingHours:', err);
      setError(err instanceof Error ? err : new Error('Failed to load working hours'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, workingHours, customWorkingHours, blockedTimeSlots]);

  // Save working hours
  const updateWorkingHours = useCallback(async (hours: WorkingHours) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await saveWorkingHours(currentUser.uid, hours);
      setWorkingHours(hours);
      
      // Update available time slots in the backend
      await calendarService.updateAvailableTimeSlots(
        currentUser.uid,
        hours,
        customWorkingHours,
        blockedTimeSlots
      );
    } catch (err) {
      console.error('Error saving working hours:', err);
      setError(err instanceof Error ? err : new Error('Failed to save working hours'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, customWorkingHours, blockedTimeSlots]);

  // Save custom working hours
  const updateCustomWorkingHours = useCallback(async (hours: CustomWorkingHours[]) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await saveCustomWorkingHours(currentUser.uid, hours);
      setCustomWorkingHours(hours);
      
      // Update available time slots in the backend
      await calendarService.updateAvailableTimeSlots(
        currentUser.uid,
        workingHours,
        hours,
        blockedTimeSlots
      );
    } catch (err) {
      console.error('Error saving custom working hours:', err);
      setError(err instanceof Error ? err : new Error('Failed to save custom working hours'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, workingHours, blockedTimeSlots]);

  // Add a blocked time slot
  const addBlockedTimeSlot = useCallback(async (timeSlot: Omit<BlockedTimeSlot, 'id' | 'type' | 'status'>) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const id = await saveBlockedTimeSlot(currentUser.uid, timeSlot);
      
      const newTimeSlot: BlockedTimeSlot = {
        id,
        ...timeSlot,
        type: 'blocked',
        status: 'scheduled'
      };
      
      const updatedBlockedTimeSlots = [...blockedTimeSlots, newTimeSlot];
      setBlockedTimeSlots(updatedBlockedTimeSlots);
      
      // Update available time slots in the backend
      await calendarService.updateAvailableTimeSlots(
        currentUser.uid,
        workingHours,
        customWorkingHours,
        updatedBlockedTimeSlots
      );
      
      return id;
    } catch (err) {
      console.error('Error adding blocked time slot:', err);
      setError(err instanceof Error ? err : new Error('Failed to add blocked time slot'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, workingHours, customWorkingHours, blockedTimeSlots]);

  // Update a blocked time slot
  const editBlockedTimeSlot = useCallback(async (
    timeSlotId: string,
    updates: Partial<Omit<BlockedTimeSlot, 'id' | 'type' | 'status'>>
  ) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await updateBlockedTimeSlot(currentUser.uid, timeSlotId, updates);
      
      const updatedBlockedTimeSlots = blockedTimeSlots.map(slot => 
        slot.id === timeSlotId 
          ? { ...slot, ...updates } 
          : slot
      );
      
      setBlockedTimeSlots(updatedBlockedTimeSlots);
      
      // Update available time slots in the backend
      await calendarService.updateAvailableTimeSlots(
        currentUser.uid,
        workingHours,
        customWorkingHours,
        updatedBlockedTimeSlots
      );
    } catch (err) {
      console.error('Error updating blocked time slot:', err);
      setError(err instanceof Error ? err : new Error('Failed to update blocked time slot'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, workingHours, customWorkingHours, blockedTimeSlots]);

  // Delete a blocked time slot
  const removeBlockedTimeSlot = useCallback(async (timeSlotId: string) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await deleteBlockedTimeSlot(currentUser.uid, timeSlotId);
      
      const updatedBlockedTimeSlots = blockedTimeSlots.filter(slot => slot.id !== timeSlotId);
      setBlockedTimeSlots(updatedBlockedTimeSlots);
      
      // Update available time slots in the backend
      await calendarService.updateAvailableTimeSlots(
        currentUser.uid,
        workingHours,
        customWorkingHours,
        updatedBlockedTimeSlots
      );
    } catch (err) {
      console.error('Error deleting blocked time slot:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete blocked time slot'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, workingHours, customWorkingHours, blockedTimeSlots]);

  // Load data on mount
  useEffect(() => {
    loadWorkingHours();
  }, [loadWorkingHours]);

  return {
    workingHours,
    customWorkingHours,
    blockedTimeSlots,
    loading,
    error,
    updateWorkingHours,
    updateCustomWorkingHours,
    addBlockedTimeSlot,
    editBlockedTimeSlot,
    removeBlockedTimeSlot,
    refreshWorkingHours: loadWorkingHours
  };
};
