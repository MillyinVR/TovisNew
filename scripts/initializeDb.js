import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAI8veylKH5YI8aRnH4-iHoqAUrtFD1LZo",
  authDomain: "beautyappaici.firebaseapp.com",
  projectId: "beautyappaici",
  storageBucket: "beautyappaici.appspot.com",
  messagingSenderId: "487403425623",
  appId: "1:487403425623:web:87e8d73a9e2424fb20b812"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const initialCategories = [
  {
    name: 'Hair Care',
    description: 'All hair related services',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/categories%2Fhair-care.jpg?alt=media',
    services: []
  },
  {
    name: 'Skin Care',
    description: 'Facial and skin treatments',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/categories%2Fskin-care.jpg?alt=media',
    services: []
  },
  {
    name: 'Nail Care',
    description: 'Manicure and pedicure services',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/categories%2Fnail-care.jpg?alt=media',
    services: []
  }
];

const initialServices = [
  {
    name: 'Haircut',
    description: 'Basic haircut service',
    basePrice: 30,
    minPrice: 30,
    priceStep: 5,
    baseDuration: 30,
    minDuration: 30,
    duration: 30,
    durationStep: 15,
    imageUrls: ['https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fhaircut.jpg?alt=media'],
    isAvailable: true,
    isBaseService: true,
    createdBy: 'admin',
    status: 'active',
    isPublished: true,
    media: [{
      url: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fhaircut.jpg?alt=media',
      type: 'image'
    }],
    price: 30
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service',
    basePrice: 80,
    minPrice: 80,
    priceStep: 10,
    baseDuration: 120,
    minDuration: 120,
    duration: 120,
    durationStep: 30,
    imageUrls: ['https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fhair-coloring.jpg?alt=media'],
    isAvailable: true,
    isBaseService: true,
    createdBy: 'admin',
    status: 'active',
    isPublished: true,
    media: [{
      url: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fhair-coloring.jpg?alt=media',
      type: 'image'
    }],
    price: 80
  },
  {
    name: 'Facial Treatment',
    description: 'Basic facial cleaning and treatment',
    basePrice: 50,
    minPrice: 50,
    priceStep: 5,
    baseDuration: 60,
    minDuration: 60,
    duration: 60,
    durationStep: 15,
    imageUrls: ['https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Ffacial.jpg?alt=media'],
    isAvailable: true,
    isBaseService: true,
    createdBy: 'admin',
    status: 'active',
    isPublished: true,
    media: [{
      url: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Ffacial.jpg?alt=media',
      type: 'image'
    }],
    price: 50
  },
  {
    name: 'Manicure',
    description: 'Basic manicure service',
    basePrice: 25,
    minPrice: 25,
    priceStep: 5,
    baseDuration: 45,
    minDuration: 45,
    duration: 45,
    durationStep: 15,
    imageUrls: ['https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fmanicure.jpg?alt=media'],
    isAvailable: true,
    isBaseService: true,
    createdBy: 'admin',
    status: 'active',
    isPublished: true,
    media: [{
      url: 'https://firebasestorage.googleapis.com/v0/b/beautyappaici.appspot.com/o/services%2Fmanicure.jpg?alt=media',
      type: 'image'
    }],
    price: 25
  }
];

async function clearCollection(collectionPath) {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);
  
  console.log(`Deleting ${snapshot.size} documents from ${collectionPath}...`);
  
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  console.log(`Deleted all documents from ${collectionPath}`);
}

async function initializeDatabase() {
  try {
    console.log('Signing in as admin...');
    await signInWithEmailAndPassword(auth, 'admin@test.com', 'Password@1');
    console.log('Successfully signed in as admin');

    // Clear existing data
    await clearCollection('serviceCategories');
    await clearCollection('services');

    console.log('Adding categories...');
    const categoryPromises = initialCategories.map(async (category) => {
      const docRef = await addDoc(collection(db, 'serviceCategories'), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...category };
    });

    const addedCategories = await Promise.all(categoryPromises);
    console.log('Categories added:', addedCategories);

    // Add services with category references
    console.log('Adding services...');
    const servicePromises = [];

    // Assign services to categories
    servicePromises.push(addDoc(collection(db, 'services'), {
      ...initialServices[0],
      categoryId: addedCategories[0].id, // Haircut -> Hair Care
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    servicePromises.push(addDoc(collection(db, 'services'), {
      ...initialServices[1],
      categoryId: addedCategories[0].id, // Hair Coloring -> Hair Care
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    servicePromises.push(addDoc(collection(db, 'services'), {
      ...initialServices[2],
      categoryId: addedCategories[1].id, // Facial Treatment -> Skin Care
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    servicePromises.push(addDoc(collection(db, 'services'), {
      ...initialServices[3],
      categoryId: addedCategories[2].id, // Manicure -> Nail Care
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));

    const addedServices = await Promise.all(servicePromises);
    console.log('Services added:', addedServices.map(doc => doc.id));

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Script completed successfully');
    setTimeout(() => process.exit(0), 1000); // Give time for Firebase operations to complete
  })
  .catch((error) => {
    console.error('Script failed:', error);
    setTimeout(() => process.exit(1), 1000); // Give time for Firebase operations to complete
  });
