import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, AppointmentStatus } from '../types/appointment';
import { 
  getProfessionalAppointments, 
  updateAppointmentStatus 
} from '../lib/api/appointments';
import { CalendarEvent } from '../types/calendar';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const useProfessionalAppointments = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load appointments
  const loadAppointments = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      console.log('Loading appointments for professional:', currentUser.uid);
      setLoading(true);
      setError(null);

      // Get all appointments for the professional
      const allAppointments = await getProfessionalAppointments(currentUser.uid);
      console.log('Fetched appointments:', allAppointments.length);
      setAppointments(allAppointments);

      // Filter today's appointments - only show confirmed (SCHEDULED) or completed appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAppts = allAppointments.filter(appt => {
        const apptDate = new Date(appt.startTime);
        return apptDate >= today && apptDate < tomorrow && 
               (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.COMPLETED);
      });
      console.log('Today appointments:', todayAppts.length);
      setTodayAppointments(todayAppts);

      // Filter pending appointments
      const pendingAppts = allAppointments.filter(
        appt => appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
      );
      console.log('Pending appointments:', pendingAppts.length);
      setPendingAppointments(pendingAppts);

      // Convert appointments to calendar events
      // Include all non-cancelled appointments in the calendar
      const events = allAppointments
        .filter(appt => appt.status !== AppointmentStatus.CANCELLED)
        .map(appt => {
          // Format the title based on status
          let title = appt.serviceName || 'Appointment';
          if (appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING) {
            // Add [PENDING] prefix if not already present
            if (!title.includes('[PENDING]')) {
              title = `[PENDING] ${title}`;
            }
          } else {
            // Remove [PENDING] prefix if present
            title = title.replace('[PENDING] ', '');
          }
          
          return {
            id: appt.id,
            title: title,
            start: new Date(appt.startTime),
            end: new Date(appt.endTime),
            status: appt.status,
            type: 'booking' as const,
            service: appt.serviceName || 'Service',
            serviceName: appt.serviceName,
            startTime: appt.startTime,
            endTime: appt.endTime,
            clientName: appt.clientName,
            extendedProps: {
              appointmentId: appt.id,
              clientId: appt.clientId
            }
          };
        });
      console.log('Calendar events:', events.length);
      setCalendarEvents(events);
      
      console.log('Appointments loaded successfully');
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(err instanceof Error ? err : new Error('Failed to load appointments'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Approve an appointment
  const approveAppointment = useCallback(async (appointmentId: string) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await updateAppointmentStatus(appointmentId, AppointmentStatus.SCHEDULED, "Approved by professional");
      
      // Update local state
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: AppointmentStatus.SCHEDULED, statusReason: "Approved by professional" } 
            : appt
        )
      );
      
      // Update pending appointments
      setPendingAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      
      // Update calendar events
      setCalendarEvents(prev => 
        prev.map(event => 
          event.id === appointmentId 
            ? { 
                ...event, 
                status: AppointmentStatus.SCHEDULED,
                title: event.title.replace('[PENDING] ', '') // Remove the pending prefix
              } 
            : event
        )
      );
      
      // Manually fetch appointments instead of using loadAppointments
      // This avoids triggering the calendar service which causes permission errors
      try {
        const allAppointments = await getProfessionalAppointments(currentUser.uid);
        setAppointments(allAppointments);
        
        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppts = allAppointments.filter(appt => {
          const apptDate = new Date(appt.startTime);
          return apptDate >= today && apptDate < tomorrow && 
                (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.COMPLETED);
        });
        setTodayAppointments(todayAppts);

        // Filter pending appointments
        const pendingAppts = allAppointments.filter(
          appt => appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
        );
        setPendingAppointments(pendingAppts);
        
        // Convert appointments to calendar events again to ensure they're properly displayed
        const events = allAppointments
          .filter(appt => appt.status !== AppointmentStatus.CANCELLED)
          .map(appt => ({
            id: appt.id,
            title: appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
              ? `[PENDING] ${appt.serviceName || 'Appointment'}`
              : appt.serviceName || 'Appointment',
            start: new Date(appt.startTime),
            end: new Date(appt.endTime),
            status: appt.status,
            type: 'booking' as const,
            service: appt.serviceName || 'Service',
            serviceName: appt.serviceName,
            startTime: appt.startTime,
            endTime: appt.endTime,
            clientName: appt.clientName,
            extendedProps: {
              appointmentId: appt.id,
              clientId: appt.clientId
            }
          }));
        setCalendarEvents(events);
      } catch (err) {
        console.error('Error refreshing appointments:', err);
      }
    } catch (err) {
      console.error('Error approving appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to approve appointment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, loadAppointments]);

  // Cancel an appointment
  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      await updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED, reason);
      
      // Update local state
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: AppointmentStatus.CANCELLED, statusReason: reason } 
            : appt
        )
      );
      
      // Update pending appointments
      setPendingAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
      
      // Update calendar events
      setCalendarEvents(prev => 
        prev.map(event => 
          event.id === appointmentId 
            ? { ...event, status: AppointmentStatus.CANCELLED } 
            : event
        )
      );
      
      // Manually fetch appointments instead of using loadAppointments
      // This avoids triggering the calendar service which causes permission errors
      try {
        const allAppointments = await getProfessionalAppointments(currentUser.uid);
        setAppointments(allAppointments);
        
        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppts = allAppointments.filter(appt => {
          const apptDate = new Date(appt.startTime);
          return apptDate >= today && apptDate < tomorrow && 
                (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.COMPLETED);
        });
        setTodayAppointments(todayAppts);

        // Filter pending appointments
        const pendingAppts = allAppointments.filter(
          appt => appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
        );
        setPendingAppointments(pendingAppts);
        
        // Convert appointments to calendar events again to ensure they're properly displayed
        const events = allAppointments
          .filter(appt => appt.status !== AppointmentStatus.CANCELLED)
          .map(appt => ({
            id: appt.id,
            title: appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
              ? `[PENDING] ${appt.serviceName || 'Appointment'}`
              : appt.serviceName || 'Appointment',
            start: new Date(appt.startTime),
            end: new Date(appt.endTime),
            status: appt.status,
            type: 'booking' as const,
            service: appt.serviceName || 'Service',
            serviceName: appt.serviceName,
            startTime: appt.startTime,
            endTime: appt.endTime,
            clientName: appt.clientName,
            extendedProps: {
              appointmentId: appt.id,
              clientId: appt.clientId
            }
          }));
        setCalendarEvents(events);
      } catch (err) {
        console.error('Error refreshing appointments:', err);
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to cancel appointment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, loadAppointments]);

  // Load data on mount
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Reschedule an appointment
  const rescheduleAppointment = useCallback(async (
    appointmentId: string, 
    startTime: string, 
    endTime: string
  ) => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Update appointment in Firestore
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        startTime,
        endTime,
        status: AppointmentStatus.PENDING, // Set back to pending for client approval
        statusReason: "Rescheduled by professional",
        updatedAt: serverTimestamp()
      });
      
      // Update local state immediately
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { 
                ...appt, 
                startTime, 
                endTime, 
                status: AppointmentStatus.PENDING, 
                statusReason: "Rescheduled by professional" 
              } 
            : appt
        )
      );
      
      // Update pending appointments - add this appointment to pending if it wasn't already
      setPendingAppointments(prev => {
        // Check if the appointment is already in the pending list
        const exists = prev.some(appt => appt.id === appointmentId);
        if (exists) {
          // Update the existing appointment
          return prev.map(appt => 
            appt.id === appointmentId 
              ? { 
                  ...appt, 
                  startTime, 
                  endTime, 
                  status: AppointmentStatus.PENDING, 
                  statusReason: "Rescheduled by professional" 
                } 
              : appt
          );
        } else {
          // Find the appointment in the main list and add it to pending
          const appointment = appointments.find(appt => appt.id === appointmentId);
          if (appointment) {
            return [
              ...prev, 
              { 
                ...appointment, 
                startTime, 
                endTime, 
                status: AppointmentStatus.PENDING, 
                statusReason: "Rescheduled by professional" 
              }
            ];
          }
          return prev;
        }
      });
      
      // Update calendar events
      setCalendarEvents(prev => 
        prev.map(event => 
          event.id === appointmentId 
            ? { 
                ...event, 
                start: new Date(startTime),
                end: new Date(endTime),
                startTime: startTime,
                endTime: endTime,
                status: AppointmentStatus.PENDING,
                title: `[PENDING] ${event.title.replace('[PENDING] ', '')}` // Ensure it has the PENDING prefix
              } 
            : event
        )
      );
      
      // Manually fetch appointments instead of using loadAppointments
      // This avoids triggering the calendar service which causes permission errors
      try {
        const allAppointments = await getProfessionalAppointments(currentUser.uid);
        setAppointments(allAppointments);
        
        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppts = allAppointments.filter(appt => {
          const apptDate = new Date(appt.startTime);
          return apptDate >= today && apptDate < tomorrow && 
                (appt.status === AppointmentStatus.SCHEDULED || appt.status === AppointmentStatus.COMPLETED);
        });
        setTodayAppointments(todayAppts);

        // Filter pending appointments
        const pendingAppts = allAppointments.filter(
          appt => appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
        );
        setPendingAppointments(pendingAppts);
        
        // Convert appointments to calendar events again to ensure they're properly displayed
        const events = allAppointments
          .filter(appt => appt.status !== AppointmentStatus.CANCELLED)
          .map(appt => ({
            id: appt.id,
            title: appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING
              ? `[PENDING] ${appt.serviceName || 'Appointment'}`
              : appt.serviceName || 'Appointment',
            start: new Date(appt.startTime),
            end: new Date(appt.endTime),
            status: appt.status,
            type: 'booking' as const,
            service: appt.serviceName || 'Service',
            serviceName: appt.serviceName,
            startTime: appt.startTime,
            endTime: appt.endTime,
            clientName: appt.clientName,
            extendedProps: {
              appointmentId: appt.id,
              clientId: appt.clientId
            }
          }));
        setCalendarEvents(events);
      } catch (err) {
        console.error('Error refreshing appointments:', err);
      }
      
      return true;
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setError(err instanceof Error ? err : new Error('Failed to reschedule appointment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, loadAppointments]);

  return {
    appointments,
    todayAppointments,
    pendingAppointments,
    calendarEvents,
    loading,
    error,
    approveAppointment,
    cancelAppointment,
    rescheduleAppointment,
    refreshAppointments: loadAppointments
  };
};
