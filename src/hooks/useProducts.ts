import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createProduct,
  getProduct,
  getProfessionalProducts,
  updateProductStock
} from '../lib/api/products';
import { Product } from '../types/aftercare';

export const useProducts = () => {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);
        setError(null);

        const fetchedProducts = await getProfessionalProducts(userProfile.id);
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userProfile]);

  const addProduct = async (
    product: Omit<Product, 'id' | 'image'>,
    imageFile: File
  ) => {
    try {
      const productId = await createProduct(product, imageFile);
      const newProduct = await getProduct(productId);
      setProducts(prev => [newProduct, ...prev]);
      return productId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const updateStock = async (productId: string, inStock: boolean) => {
    try {
      await updateProductStock(productId, inStock);
      setProducts(prev => prev.map(product =>
        product.id === productId
          ? { ...product, inStock }
          : product
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product stock');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateStock
  };
};