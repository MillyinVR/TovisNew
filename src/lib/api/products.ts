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
import { db, storage, productsRef } from '../firebase';
import { Product } from '../../types/aftercare';

export const createProduct = async (
  product: Omit<Product, 'id' | 'image'>,
  imageFile: File
): Promise<string> => {
  try {
    // Upload product image
    const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Create product document
    const productDoc = await addDoc(productsRef, {
      ...product,
      image: imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return productDoc.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getProduct = async (productId: string): Promise<Product> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    return { id: productDoc.id, ...productDoc.data() } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getProfessionalProducts = async (professionalId: string) => {
  try {
    const q = query(
      productsRef,
      where('professionalId', '==', professionalId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching professional products:', error);
    throw error;
  }
};

export const updateProductStock = async (
  productId: string,
  inStock: boolean
) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      inStock,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};