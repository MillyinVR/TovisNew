import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface FileUpload {
  file: File;
  metadata: {
    caption: string;
  };
}

export interface PortfolioItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  caption: string;
  serviceId: string;
  userId: string;
  createdAt: Date;
  tags?: string[];
  category?: string;
}

export const uploadFiles = async (params: {
  serviceId: string;
  files: FileUpload[];
  userId: string;
}): Promise<PortfolioItem[]> => {
  const storage = getStorage();
  const portfolioItems: PortfolioItem[] = [];

  try {
    for (const fileUpload of params.files) {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `portfolio/${params.userId}/${Date.now()}-${fileUpload.file.name}`);
      const snapshot = await uploadBytes(storageRef, fileUpload.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create portfolio item in Firestore
      const portfolioItem: PortfolioItem = {
        url: downloadURL,
        type: fileUpload.file.type.startsWith('image') ? 'image' : 'video',
        size: fileUpload.file.size,
        caption: fileUpload.metadata.caption,
        serviceId: params.serviceId,
        userId: params.userId,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'portfolio'), portfolioItem);
      portfolioItems.push({ ...portfolioItem, id: docRef.id });
    }

    return portfolioItems;
  } catch (error) {
    console.error('Error uploading portfolio items:', error);
    throw new Error('Failed to upload portfolio items');
  }
};

export const getPortfolioItems = async (userId: string, serviceId?: string): Promise<PortfolioItem[]> => {
  try {
    const portfolioRef = collection(db, 'portfolio');
    const q = serviceId 
      ? query(portfolioRef, where('userId', '==', userId), where('serviceId', '==', serviceId))
      : query(portfolioRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        type: data.type as 'image' | 'video',
        size: data.size,
        caption: data.caption,
        serviceId: data.serviceId,
        userId: data.userId,
        createdAt: data.createdAt.toDate(),
        tags: data.tags,
        category: data.category
      };
    });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw new Error('Failed to fetch portfolio items');
  }
};
