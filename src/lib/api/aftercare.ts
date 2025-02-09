import { 
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  db, 
  storage, 
  aftercareSummariesRef,
  createAftercareSummary,
  sendNotification 
} from '../firebase';
import { AftercareSummary } from '../../types/aftercare';

export const createSummary = async (
  summary: Omit<AftercareSummary, 'id' | 'status'>,
  beforeImages: File[],
  afterImages: File[]
): Promise<string> => {
  try {
    // Upload images first
    const uploadedBeforeImages = await Promise.all(
      beforeImages.map(async (image) => {
        const storageRef = ref(storage, `aftercare/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
      })
    );

    const uploadedAfterImages = await Promise.all(
      afterImages.map(async (image) => {
        const storageRef = ref(storage, `aftercare/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
      })
    );

    // Create the summary document
    const summaryDoc = await addDoc(aftercareSummariesRef, {
      ...summary,
      beforeImages: uploadedBeforeImages,
      afterImages: uploadedAfterImages,
      status: 'sent',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send notification to client
    await sendNotification({
      userId: summary.clientId,
      title: 'New Aftercare Summary',
      body: 'Your professional has sent you an aftercare summary',
      data: {
        type: 'aftercare_summary',
        summaryId: summaryDoc.id
      }
    });

    return summaryDoc.id;
  } catch (error) {
    console.error('Error creating aftercare summary:', error);
    throw error;
  }
};

export const getSummary = async (summaryId: string): Promise<AftercareSummary> => {
  try {
    const summaryDoc = await getDoc(doc(db, 'aftercareSummaries', summaryId));
    if (!summaryDoc.exists()) {
      throw new Error('Summary not found');
    }
    return { id: summaryDoc.id, ...summaryDoc.data() } as AftercareSummary;
  } catch (error) {
    console.error('Error fetching aftercare summary:', error);
    throw error;
  }
};

export const getProfessionalSummaries = async (professionalId: string) => {
  try {
    const q = query(
      aftercareSummariesRef,
      where('professionalId', '==', professionalId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AftercareSummary[];
  } catch (error) {
    console.error('Error fetching professional summaries:', error);
    throw error;
  }
};

export const getClientSummaries = async (clientId: string) => {
  try {
    const q = query(
      aftercareSummariesRef,
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AftercareSummary[];
  } catch (error) {
    console.error('Error fetching client summaries:', error);
    throw error;
  }
};

export const updateSummaryStatus = async (
  summaryId: string,
  status: AftercareSummary['status']
) => {
  try {
    const summaryRef = doc(db, 'aftercareSummaries', summaryId);
    await updateDoc(summaryRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating summary status:', error);
    throw error;
  }
};