import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from './firebase';
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
    const professionalServicesRef = collection(db, 'professionalServices');
    const userServicesQuery = query(
      professionalServicesRef,
      where('professionalId', '==', userId)
    );
    
    const userServices = await getDocs(userServicesQuery);
    console.log('User services:', userServices.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    return !userServices.empty;
  } catch (error) {
    console.error('Error verifying user services:', error);
    throw error;
  }
};
