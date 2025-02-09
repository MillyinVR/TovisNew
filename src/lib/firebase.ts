import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Storage References
export const profileImagesRef = (path: string) => ref(storage, `profiles/${path}`);
export const portfolioImagesRef = (path: string) => ref(storage, `portfolio/${path}`);
export const productImagesRef = (path: string) => ref(storage, `products/${path}`);
export const categoryImagesRef = (path: string) => ref(storage, `categories/${path}`);
export const verificationDocsRef = (userId: string, docType: string) => 
  ref(storage, `verification-documents/${userId}/${docType}`);

// Collection References
export const usersRef = collection(db, 'users');
export const verificationRef = collection(db, 'verifications');
export const appointmentsRef = collection(db, 'appointments');
export const aftercareSummariesRef = collection(db, 'aftercareSummaries');
export const productsRef = collection(db, 'products');
export const servicesRef = collection(db, 'serviceDefinitions');
export const serviceCategoriesRef = collection(db, 'serviceCategories');
export const serviceSubcategoriesRef = collection(db, 'serviceSubcategories');
export const professionalServicesRef = collection(db, 'professionalServices');
export const reviewsRef = collection(db, 'reviews');

// Callable Functions
export const createAftercareSummary = httpsCallable(functions, 'createAftercareSummary');
export const processPayment = httpsCallable(functions, 'processPayment');
export const sendNotification = httpsCallable(functions, 'sendNotification');
