import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { initializeServiceData } from './initializeData';

export const verifyDatabase = async () => {
  console.log('Verifying database collections...');

  try {
    // Check serviceCategories collection
    const categoriesRef = collection(db, 'serviceCategories');
    const categoriesSnapshot = await getDocs(query(categoriesRef, limit(1)));
    
    if (categoriesSnapshot.empty) {
      console.log('No service categories found, initializing data...');
      await initializeServiceData();
    } else {
      console.log('Service categories exist');
    }

    // Check serviceDefinitions collection
    const servicesRef = collection(db, 'serviceDefinitions');
    const servicesSnapshot = await getDocs(query(servicesRef, limit(1)));
    
    if (servicesSnapshot.empty) {
      console.log('No service definitions found, initializing data...');
      await initializeServiceData();
    } else {
      console.log('Service definitions exist');
    }

    // Log collection contents for debugging
    const allCategories = await getDocs(categoriesRef);
    console.log('All categories:', allCategories.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const allServices = await getDocs(servicesRef);
    console.log('All services:', allServices.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Check professionalServices collection structure
    const professionalServicesRef = collection(db, 'professionalServices');
    const professionalServicesSnapshot = await getDocs(query(professionalServicesRef, limit(1)));
    console.log('Professional services exist:', !professionalServicesSnapshot.empty);

    return {
      categoriesExist: !categoriesSnapshot.empty,
      servicesExist: !servicesSnapshot.empty,
      professionalServicesExist: !professionalServicesSnapshot.empty
    };
  } catch (error) {
    console.error('Error verifying database:', error);
    throw error;
  }
};

// Add this to AuthContext after successful login
export const verifyUserServices = async (userId: string) => {
  console.log('Verifying user services for:', userId);

  try {
    // Skip token refresh and use document-based role directly
    // This avoids the token refresh errors that are causing login issues
    console.log('Using document-based role verification for professional services');

    const professionalServicesRef = collection(db, 'professionalServices');
    const userServicesQuery = query(
      professionalServicesRef,
      where('professionalId', '==', userId)
    );
    
    try {
      const userServices = await getDocs(userServicesQuery);
      console.log('User services:', userServices.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // If no services found, check if we need to create default services
      if (userServices.empty) {
        console.log('No services found for professional, checking if we need to create defaults');
        
        // Check if this is a test professional account
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && 
            (userDoc.data().email === 'professional@test.com' || 
             userDoc.data().role === 'professional')) {
          console.log('Test professional account detected, will create default services if needed');
          // We'll handle this in the AuthContext after login
        }
      }
      
      return !userServices.empty;
    } catch (permissionError) {
      // Handle permission errors gracefully
      console.warn('Permission issue when verifying user services:', permissionError);
      console.log('This may be due to missing authentication claims or security rules.');
      
      // Try to access the user document directly as a fallback
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().role === 'professional') {
          console.log('Confirmed professional role from user document');
          return true;
        }
      } catch (userDocError) {
        console.warn('Error accessing user document:', userDocError);
      }
      
      // Return false instead of throwing an error
      return false;
    }
  } catch (error) {
    console.error('Error verifying user services:', error);
    // Return false instead of throwing an error to prevent login failures
    return false;
  }
};
