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
import { db, appointmentsRef, sendNotification } from '../firebase';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { calendarService } from './calendar';

export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const appointmentDoc = await addDoc(appointmentsRef, {
      ...appointment,
      status: AppointmentStatus.PENDING,
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
            status: AppointmentStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      } catch (calendarError) {
        console.error('Calendar sync error:', calendarError);
        // Notify admin of sync failure
        await sendNotification({
          userId: 'admin',
          title: 'Calendar Sync Failed',
          body: `Failed to sync appointment for ${appointment.serviceName}`,
          data: {
            type: 'calendar_sync_failure',
            appointmentId: appointmentDoc.id
          }
        });
      }
    }

    // Notify professional
    await sendNotification({
      userId: appointment.professionalId,
      title: 'New Appointment Request',
      body: `New appointment request for ${appointment.serviceName}`,
      data: {
        type: 'appointment_request',
        appointmentId: appointmentDoc.id
      }
    });

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

    await updateDoc(appointmentRef, {
      status,
      statusReason: reason,
      updatedAt: serverTimestamp()
    });

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

    if (status === AppointmentStatus.SCHEDULED) {
      await sendNotification({
        userId: appointmentData.clientId,
        title: 'Appointment Confirmed',
        body: `Your ${appointmentData.serviceName} appointment has been confirmed`,
        data: notificationData
      });
    } else if (status === AppointmentStatus.CANCELLED) {
      const recipientId = appointmentData.clientId;
      await sendNotification({
        userId: recipientId,
        title: 'Appointment Cancelled',
        body: `Your ${appointmentData.serviceName} appointment has been cancelled${reason ? `: ${reason}` : ''}`,
        data: notificationData
      });
    }
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};
