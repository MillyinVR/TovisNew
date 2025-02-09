import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createOrder,
  getOrder,
  getClientOrders,
  getProfessionalOrders,
  updateOrderStatus
} from '../lib/api/orders';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderInput {
  professionalId: string;
  products: OrderProduct[];
  aftercareSummaryId?: string;
}

export const useOrders = (type: 'professional' | 'client') => {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        setError(null);

        const fetchedOrders = type === 'professional'
          ? await getProfessionalOrders(userProfile.id)
          : await getClientOrders(userProfile.id);

        setOrders(fetchedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userProfile, type]);

  const placeOrder = async ({ professionalId, products, aftercareSummaryId }: CreateOrderInput) => {
    if (!userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

      const orderId = await createOrder({
        clientId: userProfile.id,
        professionalId,
        products,
        totalAmount,
        aftercareSummaryId
      });

      const newOrder = await getOrder(orderId);
      setOrders(prev => [newOrder, ...prev]);

      return orderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      throw err;
    }
  };

  const updateStatus = async (orderId: string, status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status }
          : order
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    placeOrder,
    updateStatus
  };
};
