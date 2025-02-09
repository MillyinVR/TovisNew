import { DocumentData, Timestamp } from 'firebase/firestore';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toFirestoreData = (data: Record<string, any>): DocumentData => {
  const firestoreData: DocumentData = {};
  
  if (!data || typeof data !== 'object') {
    console.warn('Invalid data passed to toFirestoreData:', data);
    return firestoreData;
  }
  
  Object.entries(data).forEach(([key, value]) => {
    try {
      // Skip undefined values, null values, and id field
      if (value === undefined || value === null || key === 'id') return;
      
      // Convert Date objects to Firestore Timestamps
      if (value instanceof Date) {
        firestoreData[key] = Timestamp.fromDate(value);
      } else if (Array.isArray(value)) {
        // Filter out null/undefined values and convert dates
        firestoreData[key] = value
          .filter(item => item !== null && item !== undefined)
          .map(item => item instanceof Date ? Timestamp.fromDate(item) : item);
      } else if (value && typeof value === 'object') {
        const nestedData = toFirestoreData(value);
        // Only add if the nested object has properties
        if (Object.keys(nestedData).length > 0) {
          firestoreData[key] = nestedData;
        }
      } else if (typeof value === 'number' && isNaN(value)) {
        // Skip NaN values
        console.warn(`Skipping NaN value for key: ${key}`);
        return;
      } else {
        firestoreData[key] = value;
      }
    } catch (err) {
      console.error(`Error processing key ${key}:`, err);
    }
  });

  return firestoreData;
};

export const fromFirestoreData = (data: DocumentData): Record<string, any> => {
  const result: Record<string, any> = {};

  if (!data || typeof data !== 'object') {
    console.warn('Invalid data passed to fromFirestoreData:', data);
    return result;
  }

  Object.entries(data).forEach(([key, value]) => {
    try {
      if (value === null || value === undefined) return;

      if (value instanceof Timestamp) {
        result[key] = value.toDate();
      } else if (Array.isArray(value)) {
        // Filter out null/undefined values and convert timestamps
        result[key] = value
          .filter(item => item !== null && item !== undefined)
          .map(item => item instanceof Timestamp ? item.toDate() : item);
      } else if (value && typeof value === 'object') {
        const nestedData = fromFirestoreData(value);
        // Only add if the nested object has properties
        if (Object.keys(nestedData).length > 0) {
          result[key] = nestedData;
        }
      } else if (typeof value === 'number' && isNaN(value)) {
        // Skip NaN values
        console.warn(`Skipping NaN value for key: ${key}`);
        return;
      } else {
        result[key] = value;
      }
    } catch (err) {
      console.error(`Error processing key ${key}:`, err);
    }
  });

  return result;
};

export const toDate = (timestamp: Timestamp | Date | undefined | null): Date => {
  try {
    if (!timestamp) return new Date();
    return timestamp instanceof Date ? timestamp : timestamp.toDate();
  } catch (err) {
    console.error('Error converting timestamp to date:', err);
    return new Date();
  }
};
