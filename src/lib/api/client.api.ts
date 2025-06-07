import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format, parseISO } from 'date-fns';

// Mock implementation of API endpoints for client-side use
// In a production environment, these would be actual API endpoints

// Get professional's working hours
export const getProfessionalWorkingHours = async (professionalId: string) => {
  try {
    // Get the professional's working hours from Firestore
    // Try the new path first (professionals collection)
    const workingHoursRef = doc(db, 'professionals', professionalId, 'workingHours', 'default');
    const workingHoursDoc = await getDoc(workingHoursRef);
    
    if (workingHoursDoc.exists()) {
      return workingHoursDoc.data();
    }
    
    // Return default working hours if not found
    return {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '10:00', end: '15:00', enabled: false },
      sunday: { start: '10:00', end: '15:00', enabled: false },
    };
  } catch (error) {
    console.error('Error fetching professional working hours:', error);
    throw error;
  }
};

// Get professional's custom working hours for a specific date
export const getProfessionalCustomWorkingHours = async (professionalId: string, date: string) => {
  try {
    // Get the professional's custom working hours from Firestore
    // Try the new path first (professionals collection)
    const customHoursRef = collection(db, 'professionals', professionalId, 'customWorkingHours');
    const q = query(customHoursRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching professional custom working hours:', error);
    throw error;
  }
};

// Get professional's appointments for a specific date
export const getProfessionalAppointmentsByDate = async (professionalId: string, date: string) => {
  try {
    // Get the professional's appointments from Firestore
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('professionalId', '==', professionalId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching professional appointments:', error);
    throw error;
  }
};

// Setup API routes for client-side use
// These functions simulate API endpoints by intercepting fetch requests
// In a production environment, these would be actual API endpoints
export const setupClientApiRoutes = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input.toString();
    
    // Handle working hours endpoint
    if (url.match(/\/api\/professionals\/(.+)\/working-hours/)) {
      const professionalId = url.match(/\/api\/professionals\/(.+)\/working-hours/)?.[1];
      
      if (professionalId) {
        try {
          const workingHours = await getProfessionalWorkingHours(professionalId);
          return {
            ok: true,
            json: async () => workingHours
          } as Response;
        } catch (error) {
          console.error('Error fetching working hours:', error);
          // Return default working hours instead of an error
          return {
            ok: true,
            json: async () => ({
              monday: { start: '09:00', end: '17:00', enabled: true },
              tuesday: { start: '09:00', end: '17:00', enabled: true },
              wednesday: { start: '09:00', end: '17:00', enabled: true },
              thursday: { start: '09:00', end: '17:00', enabled: true },
              friday: { start: '09:00', end: '17:00', enabled: true },
              saturday: { start: '10:00', end: '15:00', enabled: false },
              sunday: { start: '10:00', end: '15:00', enabled: false },
            })
          } as Response;
        }
      }
    }
    
    // Handle custom working hours endpoint
    if (url.match(/\/api\/professionals\/(.+)\/custom-working-hours/)) {
      const professionalId = url.match(/\/api\/professionals\/(.+)\/custom-working-hours/)?.[1];
      // Parse the date parameter safely
      let dateParam = null;
      try {
        if (url.includes('?')) {
          const queryString = url.split('?')[1];
          const params = new URLSearchParams(queryString);
          dateParam = params.get('date');
        }
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
      }
      
      if (professionalId && dateParam) {
        try {
          const customHours = await getProfessionalCustomWorkingHours(professionalId, dateParam);
          return {
            ok: true,
            json: async () => customHours
          } as Response;
        } catch (error) {
          console.error('Error fetching custom working hours:', error);
          // Return null instead of an error
          return {
            ok: true,
            json: async () => null
          } as Response;
        }
      }
    }
    
    // Handle appointments endpoint
    if (url.match(/\/api\/professionals\/(.+)\/appointments/)) {
      const professionalId = url.match(/\/api\/professionals\/(.+)\/appointments/)?.[1];
      // Parse the date parameter safely
      let dateParam = null;
      try {
        if (url.includes('?')) {
          const queryString = url.split('?')[1];
          const params = new URLSearchParams(queryString);
          dateParam = params.get('date');
        }
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
      }
      
      if (professionalId) {
        try {
          // Even if dateParam is null, we can still return an empty array of appointments
          const appointments = dateParam 
            ? await getProfessionalAppointmentsByDate(professionalId, dateParam)
            : [];
            
          return {
            ok: true,
            json: async () => appointments
          } as Response;
        } catch (error) {
          console.error('Error fetching appointments:', error);
          return {
            ok: true, // Return ok:true with empty array instead of error
            json: async () => []
          } as Response;
        }
      }
    }
    
    // Pass through to original fetch for all other requests
    return originalFetch(input, init);
  };
};
