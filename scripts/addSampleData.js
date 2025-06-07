/**
 * Sample Data Generation Script
 * 
 * This script adds sample data to the database to help test the structure.
 * It adds location data to professional profiles, creates portfolio items,
 * and sets up working hours.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK initialized
 * 2. Run this script with Node.js: node scripts/addSampleData.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK with service account
try {
  const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Make sure you have a valid serviceAccountKey.json file in the project root');
  process.exit(1);
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Sample location data for professionals
const sampleLocations = [
  {
    address: '123 Main St, San Francisco, CA 94105',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA'
  },
  {
    address: '456 Market St, San Francisco, CA 94103',
    coordinates: { lat: 37.7897, lng: -122.4000 },
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    country: 'USA'
  },
  {
    address: '789 Broadway, New York, NY 10003',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    city: 'New York',
    state: 'NY',
    zipCode: '10003',
    country: 'USA'
  }
];

// Sample portfolio items
const samplePortfolioItems = [
  {
    type: 'image',
    url: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample1.jpg?alt=media',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample1_thumb.jpg?alt=media',
    caption: 'Classic bob haircut with highlights',
    tags: ['haircut', 'highlights', 'bob'],
    isPublished: true
  },
  {
    type: 'image',
    url: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample2.jpg?alt=media',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample2_thumb.jpg?alt=media',
    caption: 'Natural makeup look for everyday',
    tags: ['makeup', 'natural', 'everyday'],
    isPublished: true
  },
  {
    type: 'image',
    url: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample3.jpg?alt=media',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/portfolio%2Fsample3_thumb.jpg?alt=media',
    caption: 'Gel nail art with floral design',
    tags: ['nails', 'gel', 'art', 'floral'],
    isPublished: true
  }
];

// Sample working hours
const sampleWorkingHours = {
  monday: {
    isAvailable: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  tuesday: {
    isAvailable: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  wednesday: {
    isAvailable: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  thursday: {
    isAvailable: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  friday: {
    isAvailable: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  saturday: {
    isAvailable: true,
    slots: [
      { start: '10:00', end: '15:00' }
    ]
  },
  sunday: {
    isAvailable: false,
    slots: []
  }
};

// Sample time off
const sampleTimeOff = [
  {
    title: 'Vacation',
    start: admin.firestore.Timestamp.fromDate(new Date(2025, 3, 15)), // April 15, 2025
    end: admin.firestore.Timestamp.fromDate(new Date(2025, 3, 22)),   // April 22, 2025
    allDay: true,
    notes: 'Annual vacation',
    type: 'vacation'
  }
];

// Add location data to professional profiles
async function addLocationsToProfessionals() {
  console.log('Adding location data to professional profiles...');
  
  try {
    // Get all professionals
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals found');
      return;
    }
    
    let i = 0;
    for (const doc of professionalsSnapshot.docs) {
      const professionalId = doc.id;
      const location = sampleLocations[i % sampleLocations.length];
      
      await db.collection('professionals').doc(professionalId).update({
        location,
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log(`Added location data to professional ${professionalId}`);
      i++;
    }
    
    console.log(`Added location data to ${i} professionals`);
  } catch (error) {
    console.error('Error adding location data:', error);
  }
}

// Add portfolio items to professionals
async function addPortfolioToProfessionals() {
  console.log('\nAdding portfolio items to professionals...');
  
  try {
    // Get all professionals
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals found');
      return;
    }
    
    // Get service categories and services
    const categoriesSnapshot = await db.collection('serviceCategories').get();
    const servicesSnapshot = await db.collection('services').get();
    
    if (categoriesSnapshot.empty || servicesSnapshot.empty) {
      console.log('No service categories or services found');
      return;
    }
    
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const doc of professionalsSnapshot.docs) {
      const professionalId = doc.id;
      
      // Add 3 portfolio items for each professional
      for (let i = 0; i < 3; i++) {
        const portfolioItem = {
          ...samplePortfolioItems[i % samplePortfolioItems.length],
          professionalId,
          categoryId: categories[i % categories.length].id,
          serviceId: services[i % services.length].id,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        
        const portfolioRef = db.collection('professionals').doc(professionalId)
          .collection('portfolio').doc();
        
        await portfolioRef.set(portfolioItem);
        
        console.log(`Added portfolio item ${portfolioRef.id} to professional ${professionalId}`);
      }
    }
    
    console.log(`Added portfolio items to ${professionalsSnapshot.size} professionals`);
  } catch (error) {
    console.error('Error adding portfolio items:', error);
  }
}

// Add working hours to professionals
async function addWorkingHoursToProfessionals() {
  console.log('\nAdding working hours to professionals...');
  
  try {
    // Get all professionals
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals found');
      return;
    }
    
    for (const doc of professionalsSnapshot.docs) {
      const professionalId = doc.id;
      
      // Add working hours for each day
      for (const [day, hours] of Object.entries(sampleWorkingHours)) {
        await db.collection('professionals').doc(professionalId)
          .collection('workingHours').doc(day)
          .set({
            ...hours,
            updatedAt: FieldValue.serverTimestamp()
          });
      }
      
      console.log(`Added working hours to professional ${professionalId}`);
      
      // Add time off
      for (const timeOff of sampleTimeOff) {
        await db.collection('professionals').doc(professionalId)
          .collection('timeOff').doc()
          .set({
            ...timeOff,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
      }
      
      console.log(`Added time off to professional ${professionalId}`);
    }
    
    console.log(`Added working hours to ${professionalsSnapshot.size} professionals`);
  } catch (error) {
    console.error('Error adding working hours:', error);
  }
}

// Add services to professionals
async function addServicesToProfessionals() {
  console.log('\nAdding services to professionals...');
  
  try {
    // Get all professionals
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals found');
      return;
    }
    
    // Get services
    const servicesSnapshot = await db.collection('services').get();
    
    if (servicesSnapshot.empty) {
      console.log('No services found');
      return;
    }
    
    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const doc of professionalsSnapshot.docs) {
      const professionalId = doc.id;
      
      // Add 3 services for each professional
      for (let i = 0; i < 3; i++) {
        const service = services[i % services.length];
        
        const professionalService = {
          name: service.name,
          description: service.description,
          price: service.basePrice + (i * 10), // Vary the price a bit
          duration: service.baseDuration + (i * 15), // Vary the duration a bit
          categoryId: service.categoryId,
          baseServiceId: service.id,
          isAvailable: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        
        await db.collection('professionals').doc(professionalId)
          .collection('services').doc()
          .set(professionalService);
      }
      
      console.log(`Added services to professional ${professionalId}`);
    }
    
    console.log(`Added services to ${professionalsSnapshot.size} professionals`);
  } catch (error) {
    console.error('Error adding services:', error);
  }
}

// Main function to add sample data
async function addSampleData() {
  console.log('Starting to add sample data...');
  
  try {
    // Add location data to professionals
    await addLocationsToProfessionals();
    
    // Add portfolio items to professionals
    await addPortfolioToProfessionals();
    
    // Add working hours to professionals
    await addWorkingHoursToProfessionals();
    
    // Add services to professionals
    await addServicesToProfessionals();
    
    console.log('\nSample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
    console.log('Sample data addition failed');
  }
}

// Run the sample data addition
addSampleData().then(() => {
  console.log('Sample data script finished');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error during sample data addition:', error);
  process.exit(1);
});
