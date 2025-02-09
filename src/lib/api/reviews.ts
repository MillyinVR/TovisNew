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
import { db, storage, reviewsRef, sendNotification } from '../firebase';
import { Review } from '../../types/professional';

export const createReview = async (
  review: Omit<Review, 'id' | 'createdAt'>,
  images?: File[]
): Promise<string> => {
  try {
    // Upload review images if provided
    const uploadedImages = images ? await Promise.all(
      images.map(async (image) => {
        const storageRef = ref(storage, `reviews/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        return getDownloadURL(storageRef);
      })
    ) : [];

    // Create review document
    const reviewDoc = await addDoc(reviewsRef, {
      ...review,
      images: uploadedImages,
      createdAt: serverTimestamp()
    });

    // Notify professional
    await sendNotification({
      userId: review.professionalId,
      title: 'New Review',
      body: `${review.clientName} left a ${review.rating}-star review`,
      data: {
        type: 'new_review',
        reviewId: reviewDoc.id
      }
    });

    return reviewDoc.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getReview = async (reviewId: string): Promise<Review> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    return { id: reviewDoc.id, ...reviewDoc.data() } as Review;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

export const getProfessionalReviews = async (professionalId: string) => {
  try {
    const q = query(
      reviewsRef,
      where('professionalId', '==', professionalId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching professional reviews:', error);
    throw error;
  }
};

export const getClientReviews = async (clientId: string) => {
  try {
    const q = query(
      reviewsRef,
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error fetching client reviews:', error);
    throw error;
  }
};

export const updateReviewLikes = async (
  reviewId: string,
  likes: number
) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      likes,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating review likes:', error);
    throw error;
  }
};