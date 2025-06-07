import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { updateAppointmentStatus } from '../lib/api/appointments';

export const useAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'appointments'),
      where('clientId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentsData: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(appointmentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string) => {
    try {
      // Refresh the authentication token before cancelling the appointment
      if (auth.currentUser) {
        console.log('Refreshing token before cancelling appointment');
        try {
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        } catch (tokenError) {
          console.error('Error refreshing token:', tokenError);
          // Continue with the operation even if token refresh fails
          // The periodic refresh in AuthContext should help in most cases
        }
      }
      
      await updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.CANCELLED,
        reason || 'Cancelled by client'
      );
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }, []);

  return { 
    appointments, 
    loading,
    cancelAppointment
  };
};
