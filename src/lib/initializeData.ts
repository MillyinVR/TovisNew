import { addDoc, getDocs, query } from 'firebase/firestore';
import { db, serviceCategoriesRef, servicesRef } from './firebase';

const initialCategories = [
  { name: 'Hair', description: 'Hair styling and treatments' },
  { name: 'Barber', description: 'Professional barbering services' },
  { name: 'Nails', description: 'Nail care and design' },
  { name: 'Makeup', description: 'Professional makeup services' }
];

const initialServices = [
  {
    categoryId: '',  // Will be set after categories are created
    name: 'Haircut',
    description: 'Professional haircut and styling',
    duration: 60,
    basePrice: 50
  },
  {
    categoryId: '',
    name: 'Color',
    description: 'Hair coloring services',
    duration: 120,
    basePrice: 100
  },
  {
    categoryId: '',
    name: 'Fade',
    description: 'Professional fade haircut',
    duration: 45,
    basePrice: 35
  },
  {
    categoryId: '',
    name: 'Manicure',
    description: 'Basic manicure service',
    duration: 45,
    basePrice: 30
  }
];

export async function initializeServiceData() {
  // Check if data already exists
  const categoriesSnapshot = await getDocs(query(serviceCategoriesRef));
  if (!categoriesSnapshot.empty) {
    console.log('Service data already initialized');
    return;
  }

  // Add categories
  const categoryMap = new Map();
  for (const category of initialCategories) {
    const docRef = await addDoc(serviceCategoriesRef, category);
    categoryMap.set(category.name, docRef.id);
  }

  // Add services with correct category IDs
  for (const service of initialServices) {
    let categoryId = '';
    if (service.name === 'Haircut' || service.name === 'Color') {
      categoryId = categoryMap.get('Hair');
    } else if (service.name === 'Fade') {
      categoryId = categoryMap.get('Barber');
    } else if (service.name === 'Manicure') {
      categoryId = categoryMap.get('Nails');
    }

    if (categoryId) {
      await addDoc(servicesRef, {
        ...service,
        categoryId
      });
    }
  }

  console.log('Service data initialized successfully');
}
