import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, sendNotification } from '../firebase';

const ordersRef = collection(db, 'orders');

interface ProductOrder {
  id: string;
  clientId: string;
  professionalId: string;
  products: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  aftercareSummaryId?: string;
}

export const createOrder = async (
  order: Omit<ProductOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const orderDoc = await addDoc(ordersRef, {
      ...order,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Notify professional
    await sendNotification({
      userId: order.professionalId,
      title: 'New Product Order',
      body: `A client has placed an order for ${order.products.length} products`,
      data: {
        type: 'product_order',
        orderId: orderDoc.id
      }
    });

    return orderDoc.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrder = async (orderId: string): Promise<ProductOrder> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }
    return { id: orderDoc.id, ...orderDoc.data() } as ProductOrder;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const getClientOrders = async (clientId: string) => {
  try {
    const q = query(
      ordersRef,
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProductOrder[];
  } catch (error) {
    console.error('Error fetching client orders:', error);
    throw error;
  }
};

export const getProfessionalOrders = async (professionalId: string) => {
  try {
    const q = query(
      ordersRef,
      where('professionalId', '==', professionalId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProductOrder[];
  } catch (error) {
    console.error('Error fetching professional orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: ProductOrder['status']
) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const order = await getDoc(orderRef);
    
    if (!order.exists()) {
      throw new Error('Order not found');
    }

    const orderData = order.data() as ProductOrder;

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });

    // Send notification to client
    const notificationData = {
      orderId,
      type: `order_${status}`,
      productCount: orderData.products.length
    };

    await sendNotification({
      userId: orderData.clientId,
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: `Your order for ${orderData.products.length} products has been ${status}`,
      data: notificationData
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
