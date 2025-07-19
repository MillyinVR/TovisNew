import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import dotenv from 'dotenv';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAppointmentFlow() {
  try {
    console.log('Testing appointment flow...');

    // First, let's check what professionals exist in the database
    console.log('\n1. Checking existing professionals...');
    const usersRef = collection(db, 'users');
    const professionalsQuery = query(usersRef, where('role', '==', 'professional'));
    const professionalsSnapshot = await getDocs(professionalsQuery);

    console.log(`Found ${professionalsSnapshot.size} professionals:`);
    const professionals = [];
    professionalsSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      professionals.push(data);
      console.log(`- ${data.displayName || 'Unknown'} (ID: ${doc.id})`);
    });

    if (professionals.length === 0) {
      console.log('No professionals found in database!');
      return;
    }

    // Check existing appointments
    console.log('\n2. Checking existing appointments...');
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsSnapshot = await getDocs(appointmentsRef);

    console.log(`Found ${appointmentsSnapshot.size} appointments:`);
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Appointment ${doc.id}:`);
      console.log(`  Professional ID: ${data.professionalId}`);
      console.log(`  Client ID: ${data.clientId}`);
      console.log(`  Service: ${data.serviceName}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Date: ${data.startTime}`);
    });

    // Test creating a new appointment
    console.log('\n3. Testing appointment creation...');
    const testProfessional = professionals[0];
    const testAppointment = {
      professionalId: testProfessional.id,
      professionalName: testProfessional.displayName || 'Test Professional',
      clientId: 'test-client-id',
      clientName: 'Test Client',
      service: 'test-service-id',
      serviceName: 'Test Service',
      date: '2025-01-20',
      startTime: '2025-01-20T10:00:00',
      endTime: '2025-01-20T11:00:00',
      location: 'Test Location',
      status: 'REQUESTED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Creating test appointment with data:', testAppointment);
    const appointmentDoc = await addDoc(appointmentsRef, testAppointment);
    console.log(`Created appointment with ID: ${appointmentDoc.id}`);

    // Test querying appointments for this professional
    console.log('\n4. Testing appointment retrieval...');
    const professionalAppointmentsQuery = query(
      appointmentsRef,
      where('professionalId', '==', testProfessional.id)
    );
    const professionalAppointmentsSnapshot = await getDocs(professionalAppointmentsQuery);

    console.log(
      `Found ${professionalAppointmentsSnapshot.size} appointments for professional ${testProfessional.id}:`
    );
    professionalAppointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.serviceName} on ${data.startTime} (Status: ${data.status})`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Load environment variables from .env file
dotenv.config();

testAppointmentFlow();
