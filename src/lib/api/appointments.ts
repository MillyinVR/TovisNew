import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, appointmentsRef, sendNotification, auth } from '../firebase';
import axios from 'axios';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { calendarService } from './calendar';

export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Ensure professionalId is correctly passed
    if (!appointment.professionalId) {
      throw new Error('Missing professionalId in appointment data');
    }
    
    console.log('Creating appointment with professionalId:', appointment.professionalId);
    
    const appointmentDoc = await addDoc(appointmentsRef, {
      ...appointment,
      status: AppointmentStatus.REQUESTED,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Sync with calendar if professional has connected calendar
    if (appointment.calendarSync) {
      try {
        if (!calendarService.provider) {
          throw new Error('Calendar provider not initialized');
        }
        
        await calendarService.syncAppointments([
          {
            ...appointment,
            id: appointmentDoc.id,
            status: AppointmentStatus.REQUESTED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } catch (calendarError) {
        console.error('Calendar sync error:', calendarError);
        // Notify admin of sync failure
        try {
          await sendNotification({
            userId: 'admin',
            title: 'Calendar Sync Failed',
            body: `Failed to sync appointment for ${appointment.serviceName}`,
            data: {
              type: 'calendar_sync_failure',
              appointmentId: appointmentDoc.id
            }
          });
        } catch (notificationError) {
          console.error('Failed to send calendar sync failure notification:', notificationError);
          // Continue with appointment creation even if notification fails
        }
      }
    }

    // Notify professional
    try {
      // Try using the callable function first
      try {
        await sendNotification({
          userId: appointment.professionalId,
          title: 'New Appointment Request',
          body: `New appointment request for ${appointment.serviceName}`,
          data: {
            type: 'appointment_request',
            appointmentId: appointmentDoc.id
          }
        });
      } catch (callableError) {
        console.warn('Callable function failed, trying HTTP endpoint:', callableError);
        // Fallback to direct HTTP call if callable function fails
        await axios.post(
          'https://us-central1-beautyappaici.cloudfunctions.net/sendNotificationHttp',
          {
            userId: appointment.professionalId,
            title: 'New Appointment Request',
            body: `New appointment request for ${appointment.serviceName}`,
            data: {
              type: 'appointment_request',
              appointmentId: appointmentDoc.id
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (notificationError) {
      // Log the error but don't fail the appointment creation
      console.error('Failed to send notification, but appointment was created:', notificationError);
      // The appointment is still created, we just couldn't notify the professional
    }

    return appointmentDoc.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointment = async (appointmentId: string): Promise<Appointment> => {
  try {
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    if (!appointmentDoc.exists()) {
      throw new Error('Appointment not found');
    }
    return { id: appointmentDoc.id, ...appointmentDoc.data() } as Appointment;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

export const getProfessionalAppointments = async (
  professionalId: string,
  status?: Appointment['status']
) => {
  try {
    let q = query(
      appointmentsRef,
      where('professionalId', '==', professionalId),
      orderBy('startTime', 'asc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error fetching professional appointments:', error);
    throw error;
  }
};

export const getClientAppointments = async (
  clientId: string,
  status?: Appointment['status']
) => {
  try {
    let q = query(
      appointmentsRef,
      where('clientId', '==', clientId),
      orderBy('startTime', 'asc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: Appointment['status'],
  reason?: string
) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const appointment = await getDoc(appointmentRef);
    
    if (!appointment.exists()) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointment.data() as Appointment;

    // Create update object with required fields
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // Only add statusReason if it's provided and not undefined
    if (reason !== undefined) {
      updateData.statusReason = reason;
    } else {
      // Set a default reason based on status if no reason is provided
      if (status === AppointmentStatus.SCHEDULED) {
        updateData.statusReason = "Approved by professional";
      } else if (status === AppointmentStatus.CANCELLED) {
        updateData.statusReason = "Cancelled";
      } else if (status === AppointmentStatus.PENDING) {
        updateData.statusReason = "Pending approval";
      }
    }

    // Try to refresh the token but don't force it, and don't let it fail the operation
    try {
      if (auth.currentUser) {
        console.log('Refreshing token before updating appointment status');
        // Use false to avoid forcing a token refresh, which can cause logout issues
        await auth.currentUser.getIdToken(false);
        console.log('Token refreshed successfully');
      }
    } catch (tokenError) {
      // Log the error but continue with the operation
      console.error('Error refreshing token, but continuing with appointment update:', tokenError);
    }

    await updateDoc(appointmentRef, updateData);

    // Sync with calendar if professional has connected calendar
    if (appointmentData.calendarSync) {
      try {
        await calendarService.syncAppointments([
          {
            ...appointmentData,
            status
          }
        ]);
      } catch (calendarError) {
        console.error('Calendar sync error:', calendarError);
      }
    }

    // Send notification based on status change
    const notificationData = {
      appointmentId,
      type: `appointment_${status}`,
        service: appointmentData.serviceName
    };

    try {
      const notificationPayload = status === AppointmentStatus.SCHEDULED 
        ? {
            userId: appointmentData.clientId,
            title: 'Appointment Confirmed',
            body: `Your ${appointmentData.serviceName} appointment has been confirmed`,
            data: notificationData
          }
        : status === AppointmentStatus.CANCELLED
          ? {
              userId: appointmentData.clientId,
              title: 'Appointment Cancelled',
              body: `Your ${appointmentData.serviceName} appointment has been cancelled${reason ? `: ${reason}` : ''}`,
              data: notificationData
            }
          : null;
      
      if (notificationPayload) {
        // Try using the callable function first
        try {
          await sendNotification(notificationPayload);
        } catch (callableError) {
          console.warn('Callable function failed, trying HTTP endpoint:', callableError);
          // Fallback to direct HTTP call if callable function fails
          await axios.post(
            'https://us-central1-beautyappaici.cloudfunctions.net/sendNotificationHttp',
            notificationPayload,
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
    } catch (notificationError) {
      // Log the error but don't fail the appointment status update
      console.error('Failed to send notification, but appointment status was updated:', notificationError);
      // The appointment status is still updated, we just couldn't notify the client
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
